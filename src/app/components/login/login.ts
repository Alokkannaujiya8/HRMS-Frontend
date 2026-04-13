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
      this.router.navigate(['/employees']);
    } else {
      this.authService.loggedInSignal.set(false);
    }
  }

  onLogin(): void {
    this.errorMessage = '';

    this.authService.login(this.loginObj).subscribe({
      next: (res) => {
        if (res.token) {
          this.authService.saveSession(res.token, res.refreshToken, res.role);
          alert('Login Successful!');

          this.router.navigate(['/employees']);
        }
      },
      error: (err: Error) => {
        this.errorMessage = err.message || 'Invalid username or password.';
      },
    });
  }
}
