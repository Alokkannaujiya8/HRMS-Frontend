import { Component, OnInit } from '@angular/core';
import { Auth } from '../../services/auth';
import { Router } from '@angular/router';
import { LoginRequest } from '../../models/auth.model';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit {
  loginObj: LoginRequest = {
    username: '',
    password: '',
  };

  errorMessage: string = '';

  constructor(
    private authService: Auth,
    private router: Router,
  ) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      const storedRole = localStorage.getItem('role') ?? '';
      this.router.navigate([this.getLandingRoute(storedRole)]);
    } else {
      this.authService.loggedInSignal.set(false);
    }
  }

  onLogin(): void {
    this.errorMessage = '';

    this.authService.login(this.loginObj).subscribe({
      next: (res) => {
        if (res.token) {
          const normalizedRole = (res.role ?? '').trim();
          this.authService.saveSession(
            res.token,
            res.refreshToken,
            normalizedRole,
            this.loginObj.username.trim(),
          );
          const savedRole = localStorage.getItem('role') ?? normalizedRole;
          if (savedRole.trim().toLowerCase() === 'admin') {
            alert('Admin login hua hai');
          }
          this.router.navigate([this.getLandingRoute(savedRole)]);
        }
      },
      error: (err: Error) => {
        this.errorMessage = err.message || 'Invalid username or password.';
      },
    });
  }

  private getLandingRoute(role: string): string {
    const normalizedRole = role.trim().toLowerCase();
    if (normalizedRole === 'admin' || normalizedRole === 'hr') {
      return '/hr/dashboard';
    }
    return '/employee';
  }
}
