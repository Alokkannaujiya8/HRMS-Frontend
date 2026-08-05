import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Auth } from '../../services/auth';
import { SignalRNotificationService } from '../../services/signalr-notification.service';
import { ToastService } from '../../services/toast.service';

export interface MenuItem {
  title: string;
  icon: string;
  emoji: string;
  route?: string;
  badge?: number | string;
  badgeColor?: string;
  roles?: string[];
  permission?: string;
  subItems?: MenuItem[];
  expanded?: boolean;
  disabled?: boolean;
}

export interface MenuGroup {
  groupName: string;
  items: MenuItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent implements OnInit, OnDestroy {
  isCollapsed = false;
  searchQuery = '';
  username = '';
  userRole = '';
  avatarInitial = 'A';
  unreadNotifications = 5;
  pendingLeavesCount = 3;
  private notificationSub!: Subscription;

  menuGroups: MenuGroup[] = [
    {
      groupName: 'Main Navigation',
      items: [
        {
          title: 'Dashboard',
          icon: 'dashboard',
          emoji: '🏠',
          route: '/hr/dashboard',
          badge: '8 Pending',
          badgeColor: 'cyan',
          roles: ['admin', 'hr', 'employee']
        }
      ]
    },
    {
      groupName: 'Core HR & Operations',
      items: [
        { title: 'Employees', icon: 'groups', emoji: '👥', route: '/hr/employees', roles: ['admin', 'hr'] },
        { title: 'Attendance', icon: 'how_to_reg', emoji: '📅', route: '/hr/attendance', roles: ['admin', 'hr'] },
        { title: 'Leave', icon: 'event_busy', emoji: '📄', route: '/hr/leave-management', badge: 3, badgeColor: 'cyan', roles: ['admin', 'hr'] },
        { title: 'Payroll', icon: 'receipt_long', emoji: '💰', route: '/hr/my-payroll', roles: ['admin', 'hr'] },
        { title: 'Salary Management', icon: 'payments', emoji: '💵', route: '/hr/salary-management', roles: ['admin', 'hr'] },
        { title: 'Departments', icon: 'corporate_fare', emoji: '🏢', route: '/departments', roles: ['admin'] },
        { title: 'Assets', icon: 'inventory_2', emoji: '📦', route: '/hr/assets', badge: 'Alerts', badgeColor: 'orange', roles: ['admin', 'hr'] },
        {
          title: 'Reports',
          icon: 'analytics',
          emoji: '📊',
          route: '/hr/reports',
          roles: ['admin', 'hr'],
          expanded: false,
          subItems: [
            { title: 'Attendance Report', icon: 'how_to_reg', emoji: '📅', route: '/hr/reports' },
            { title: 'Payroll Report', icon: 'payments', emoji: '💰', route: '/hr/reports' },
            { title: 'Leave Summary', icon: 'event_busy', emoji: '📄', route: '/hr/reports' },
            { title: 'Employee Audit', icon: 'badge', emoji: '👥', route: '/hr/reports' },
            { title: 'Assets Inventory', icon: 'inventory_2', emoji: '📦', route: '/hr/reports' }
          ]
        },
        { title: 'Recruitment', icon: 'target', emoji: '🎯', disabled: true, badge: 'Soon', badgeColor: 'purple', roles: ['admin'] },
        { title: 'Performance', icon: 'star', emoji: '⭐', disabled: true, badge: 'Soon', badgeColor: 'purple', roles: ['admin'] }
      ]
    },
    {
      groupName: 'System Configuration',
      items: [
        {
          title: 'Master Data',
          icon: 'settings',
          emoji: '⚙',
          route: '/hr/master-data',
          roles: ['admin'],
          expanded: false,
          subItems: [
            { title: 'Departments', icon: 'corporate_fare', emoji: '🏢', route: '/departments' },
            { title: 'Designations', icon: 'badge', emoji: '🪪', route: '/hr/master-data' },
            { title: 'Holiday Calendar', icon: 'event', emoji: '🗓️', route: '/hr/master-data' },
            { title: 'Shift Management', icon: 'schedule', emoji: '⏰', route: '/hr/master-data' },
            { title: 'Role Permissions', icon: 'security', emoji: '🛡️', route: '/hr/master-data' },
            { title: 'System Settings', icon: 'tune', emoji: '🔧', route: '/hr/master-data' }
          ]
        }
      ]
    },
    {
      groupName: 'Employee Workspace',
      items: [
        { title: 'Employee Portal', icon: 'person', emoji: '👤', route: '/employee/attendance', roles: ['employee'] },
        { title: 'My Payroll', icon: 'receipt_long', emoji: '🧾', route: '/hr/my-payroll', roles: ['employee'] },
        { title: 'Notifications', icon: 'notifications', emoji: '🔔', route: '/hr/notifications', roles: ['admin', 'hr', 'employee'] },
        { title: 'Profile', icon: 'account_circle', emoji: '👤', route: '/hr/staff-master', roles: ['admin', 'hr', 'employee'] }
      ]
    }
  ];

  filteredGroups: MenuGroup[] = [];

  constructor(
    public authService: Auth,
    private signalRService: SignalRNotificationService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.username = localStorage.getItem('username') || 'Alok Kannaujiya';
    this.userRole = (localStorage.getItem('role') || 'Employee').trim();
    this.avatarInitial = this.username.charAt(0).toUpperCase();

    this.filterMenu();

    this.notificationSub = this.signalRService.notifications$.subscribe(() => {
      this.unreadNotifications++;
    });
  }

  ngOnDestroy(): void {
    if (this.notificationSub) {
      this.notificationSub.unsubscribe();
    }
  }

  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  toggleSubMenu(item: MenuItem): void {
    if (item.subItems) {
      item.expanded = !item.expanded;
    }
  }

  onItemClick(item: MenuItem, event: Event): void {
    if (item.disabled || item.badge === 'Soon') {
      event.preventDefault();
      event.stopPropagation();
      this.toastService.showInfo(
        `${item.title} module is currently under development. Scheduled for Q3 2026 release!`,
        'Module In Progress'
      );
    }
  }

  filterMenu(): void {
    const query = this.searchQuery.trim().toLowerCase();
    const currentRole = this.userRole.toLowerCase();

    this.filteredGroups = this.menuGroups
      .map(group => {
        const matchingItems = group.items.filter(item => {
          const matchesRole = !item.roles || item.roles.includes(currentRole);
          const matchesQuery = !query ||
            item.title.toLowerCase().includes(query) ||
            (item.subItems && item.subItems.some(sub => sub.title.toLowerCase().includes(query)));
          return matchesRole && matchesQuery;
        });

        return {
          groupName: group.groupName,
          items: matchingItems
        };
      })
      .filter(group => group.items.length > 0);
  }

  logout(): void {
    this.authService.logout();
  }
}
