import { Injectable, signal } from '@angular/core';
import { HttpBackend, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import {
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  RegisterRequest,
  RegisterResponse,
  UserRole,
} from '../models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private readonly apiUrl = 'https://localhost:7147/api/auth';
  private readonly httpWithoutInterceptor: HttpClient;

  loggedInSignal = signal<boolean>(this.checkToken());

  constructor(
    private http: HttpClient,
    private router: Router,
    httpBackend: HttpBackend,
  ) {
    this.httpWithoutInterceptor = new HttpClient(httpBackend);
  }

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

  saveSession(token: string, refreshToken: string, role: string, username: string) {
    const normalizedRole = this.normalizeRole(role) ?? 'Employee';
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('role', normalizedRole);
    localStorage.setItem('username', username);

    this.loggedInSignal.set(true);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('role');
    localStorage.removeItem('username');

    this.loggedInSignal.set(false);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return this.checkToken();
  }

  getAccessToken(): string {
    return localStorage.getItem('token') ?? '';
  }

  getRefreshToken(): string {
    return localStorage.getItem('refreshToken') ?? '';
  }

  refreshAccessToken(): Observable<RefreshTokenResponse> {
    const request: RefreshTokenRequest = {
      refreshToken: this.getRefreshToken(),
    };
    return this.httpWithoutInterceptor
      .post<RefreshTokenResponse>(`${this.apiUrl}/refresh-token`, request)
      .pipe(catchError((error) => this.handleError(error, 'refresh token')));
  }

  updateTokens(token: string, refreshToken: string, role?: string): void {
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    const normalizedRole = this.normalizeRole(role);
    if (normalizedRole) {
      localStorage.setItem('role', normalizedRole);
    }
    this.loggedInSignal.set(true);
  }

  private normalizeRole(role?: string): UserRole | undefined {
    const normalized = role?.trim().toLowerCase();
    if (!normalized) {
      return undefined;
    }

    if (normalized === 'admin') {
      return 'Admin';
    }
    if (normalized === 'hr') {
      return 'HR';
    }
    if (normalized === 'employee') {
      return 'Employee';
    }
    return undefined;
  }

  private handleError(error: HttpErrorResponse, operation: string): Observable<never> {
    const message = error.error?.message || error.message || `Unable to ${operation}.`;
    return throwError(() => new Error(message));
  }
}
