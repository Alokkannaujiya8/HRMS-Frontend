import { Component, OnInit } from '@angular/core';
import { Auth } from '../../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit {
  loginObj: any = {
    username: '',
    password: '',
  };

  errorMessage: string = '';

  constructor(
    private authService: Auth,
    private router: Router,
  ) {}

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/employees']);
    } else {
      this.authService.loggedInSignal.set(false);
    }
  }

  onLogin() {
    this.authService.login(this.loginObj).subscribe({
      next: (res) => {
        if (res.token) {
          this.authService.saveSession(res.token, res.refreshToken, res.role);
          alert('Login Successful!');

          this.router.navigate(['/employees']);
        }
      },
      error: (err) => {
        this.errorMessage = 'Invalid Username or Password';
        console.error('Login Error:', err);
      },
    });
  }
}
