import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  registerObj: any = {
    username: '',
    password: '',
    role: 'Employee',
  };

  errorMessage: string = '';

  constructor(private authService: Auth, private router: Router) {}

  onRegister() {
    this.authService.register(this.registerObj).subscribe({
      next: () => {
        alert('Registration Successful! Please login.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Username already exists or Registration Failed';
        console.error('Register Error:', err);
      },
    });
  }
}
