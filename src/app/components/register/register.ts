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

  constructor(private authService: Auth, private router: Router) {}

  onRegister(): void {
    this.errorMessage = '';

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
}
