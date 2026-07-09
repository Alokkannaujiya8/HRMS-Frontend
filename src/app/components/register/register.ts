import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { RegisterRequest } from '../../models/auth.model';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  registerObj: RegisterRequest = {
    username: '',
    password: '',
    role: 'Employee',
  };

  errorMessage: string = '';
  confirmPassword = '';
  showPassword = false;
  showConfirmPassword = false;

  constructor(private authService: Auth, private router: Router) {}

  onRegister(): void {
    this.errorMessage = '';

    if (this.registerObj.password !== this.confirmPassword) {
      this.errorMessage = 'Password and confirm password do not match.';
      return;
    }

    if (this.registerObj.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters.';
      return;
    }

    this.authService.register(this.registerObj).subscribe({
      next: () => {
        alert('Registration Successful! Please login.');
        this.router.navigate(['/login']);
      },
      error: (err: Error) => {
        this.errorMessage = err.message || 'Username already exists or registration failed.';
      },
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}
