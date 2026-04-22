import { Component, signal } from '@angular/core';
import { Auth } from './services/auth';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('HR-Management-System');

  constructor(public authService: Auth) {}

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.authService.loggedInSignal.set(true);
    } else {
      this.authService.loggedInSignal.set(false);
    }
  }

  get userRole(): string {
    return (localStorage.getItem('role') ?? '').trim().toLowerCase();
  }

  get userRoleLabel(): string {
    if (this.userRole === 'admin') {
      return 'Admin';
    }
    if (this.userRole === 'hr') {
      return 'HR';
    }
    if (this.userRole === 'employee') {
      return 'Employee';
    }
    return 'User';
  }

  get canManageDepartments(): boolean {
    return this.userRole === 'admin';
  }

  get isAdmin(): boolean {
    return this.userRole === 'admin';
  }

  get isHr(): boolean {
    return this.userRole === 'hr';
  }

  get isEmployee(): boolean {
    return this.userRole === 'employee';
  }

  get canViewHrModules(): boolean {
    return this.isAdmin || this.isHr;
  }

  get canViewEmployeeModules(): boolean {
    return this.isEmployee;
  }

  onLogout() {
    this.authService.logout();
  }
}
