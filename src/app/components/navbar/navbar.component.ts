import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { Auth } from '../../services/auth';
import { SignalRNotificationService, NotificationPayload } from '../../services/signalr-notification.service';

export interface CommandPaletteItem {
  title: string;
  category: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnInit, OnDestroy {
  currentTime = '';
  currentDate = '';
  breadcrumb = 'Dashboard';
  username = '';
  userRole = '';
  avatarInitial = 'A';

  themeMode: 'dark' | 'light' | 'system' = 'dark';
  isFullscreen = false;
  showNotificationDropdown = false;
  showProfileDropdown = false;
  showCommandPalette = false;
  commandSearchQuery = '';

  notifications: NotificationPayload[] = [
    { title: 'Leave Approved', message: 'Casual leave for 2 days approved by Admin', type: 'LeaveApproved', timestamp: '10 mins ago' },
    { title: 'Attendance Updated', message: 'Check-in recorded at 09:15 AM', type: 'AttendanceUpdated', timestamp: '1 hour ago' },
    { title: 'Payroll Generated', message: 'Monthly salary slip generated for July 2026', type: 'PayrollGenerated', timestamp: '2 hours ago' },
    { title: 'Asset Assigned', message: 'Dell XPS 15 Laptop assigned to your account', type: 'AssetAssigned', timestamp: 'Yesterday' }
  ];

  unreadCount = 4;

  commandItems: CommandPaletteItem[] = [
    { title: 'Search Employees & Directory', category: 'Staff', icon: '👥', route: '/hr/employees' },
    { title: 'Attendance & Check-in Logs', category: 'Time', icon: '📅', route: '/hr/attendance' },
    { title: 'Leave Management & Approvals', category: 'Requests', icon: '📄', route: '/hr/leave-management' },
    { title: 'Salary Management & Pay Grades', category: 'Finance', icon: '💵', route: '/hr/salary-management' },
    { title: 'My Payroll & Payslip Downloads', category: 'Finance', icon: '💰', route: '/hr/my-payroll' },
    { title: 'Asset Inventory & Tracking', category: 'IT Assets', icon: '📦', route: '/hr/assets' },
    { title: 'Department Hierarchy', category: 'Org', icon: '🏢', route: '/departments' },
    { title: 'Executive Analytics Reports', category: 'BI Reports', icon: '📊', route: '/hr/reports' },
    { title: 'Master Data Settings', category: 'System', icon: '⚙', route: '/hr/master-data' }
  ];

  filteredCommands: CommandPaletteItem[] = [];

  private clockInterval: any;
  private routeSub!: Subscription;
  private signalRSub!: Subscription;

  constructor(
    public authService: Auth,
    private signalRService: SignalRNotificationService,
    private router: Router
  ) {}

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.toggleCommandPalette();
    } else if (event.key === 'Escape' && this.showCommandPalette) {
      this.showCommandPalette = false;
    }
  }

  ngOnInit(): void {
    this.username = localStorage.getItem('username') || 'Alok Kannaujiya';
    this.userRole = (localStorage.getItem('role') || 'Employee').trim();
    this.avatarInitial = this.username.charAt(0).toUpperCase();

    const savedTheme = (localStorage.getItem('theme_preference') as 'dark' | 'light' | 'system') || 'dark';
    this.setTheme(savedTheme);

    this.startClock();
    this.updateBreadcrumb(this.router.url);
    this.filterCommands();

    this.routeSub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.updateBreadcrumb(event.urlAfterRedirects);
        this.showNotificationDropdown = false;
        this.showProfileDropdown = false;
        this.showCommandPalette = false;
      });

    this.signalRSub = this.signalRService.notifications$.subscribe((notification: NotificationPayload) => {
      this.notifications.unshift(notification);
      this.unreadCount++;
    });
  }

  ngOnDestroy(): void {
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
    }
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
    if (this.signalRSub) {
      this.signalRSub.unsubscribe();
    }
  }

  private startClock(): void {
    const updateTime = () => {
      const now = new Date();
      this.currentTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      this.currentDate = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
    };
    updateTime();
    this.clockInterval = setInterval(updateTime, 1000);
  }

  private updateBreadcrumb(url: string): void {
    const segments = url.split('/').filter(Boolean);
    if (segments.length === 0) {
      this.breadcrumb = 'Home';
      return;
    }
    this.breadcrumb = segments
      .map(s => s.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()))
      .join(' / ');
  }

  setTheme(theme: 'dark' | 'light' | 'system'): void {
    this.themeMode = theme;
    localStorage.setItem('theme_preference', theme);

    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.body.classList.toggle('light-theme', !prefersDark);
    } else {
      document.body.classList.toggle('light-theme', theme === 'light');
    }
  }

  toggleTheme(): void {
    const nextTheme = this.themeMode === 'dark' ? 'light' : 'dark';
    this.setTheme(nextTheme);
  }

  toggleFullscreen(): void {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => this.isFullscreen = true).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => this.isFullscreen = false).catch(() => {});
      }
    }
  }

  toggleNotifications(): void {
    this.showNotificationDropdown = !this.showNotificationDropdown;
    this.showProfileDropdown = false;
  }

  markAllAsRead(): void {
    this.unreadCount = 0;
  }

  toggleProfile(): void {
    this.showProfileDropdown = !this.showProfileDropdown;
    this.showNotificationDropdown = false;
  }

  toggleCommandPalette(): void {
    this.showCommandPalette = !this.showCommandPalette;
    this.commandSearchQuery = '';
    this.filterCommands();
  }

  filterCommands(): void {
    const q = this.commandSearchQuery.trim().toLowerCase();
    if (!q) {
      this.filteredCommands = [...this.commandItems];
    } else {
      this.filteredCommands = this.commandItems.filter(item =>
        item.title.toLowerCase().includes(q) || item.category.toLowerCase().includes(q)
      );
    }
  }

  executeCommand(route: string): void {
    this.showCommandPalette = false;
    this.router.navigate([route]);
  }

  logout(): void {
    this.authService.logout();
  }
}
