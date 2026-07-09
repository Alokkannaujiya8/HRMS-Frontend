import { Component } from '@angular/core';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-access-denied',
  standalone: false,
  templateUrl: './access-denied.html',
  styleUrl: './access-denied.scss',
})
export class AccessDenied {
  constructor(private authService: Auth) {}

  get homeRoute(): string {
    return this.authService.getLandingRoute();
  }
}
