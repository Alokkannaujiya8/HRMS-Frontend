import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  UserRole,
} from '../models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private readonly apiUrl = 'https://localhost:7147/api/auth';

  loggedInSignal = signal<boolean>(this.checkToken());

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  private checkToken(): boolean {
    const token = localStorage.getItem('token');
    return !!token && token !== 'undefined' && token !== null;
  }

  register(obj: RegisterRequest): Observable<RegisterResponse> {
    return this.http
      .post<RegisterResponse>(`${this.apiUrl}/register`, obj)
      .pipe(catchError((error) => this.handleError(error, 'register')));
  }

  login(obj: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, obj)
      .pipe(catchError((error) => this.handleError(error, 'login')));
  }

  saveSession(token: string, refreshToken: string, role: UserRole) {
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('role', role);

    this.loggedInSignal.set(true);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('role');

    this.loggedInSignal.set(false);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return this.checkToken();
  }

  private handleError(error: HttpErrorResponse, operation: string): Observable<never> {
    const message = error.error?.message || error.message || `Unable to ${operation}.`;
    return throwError(() => new Error(message));
  }
}
