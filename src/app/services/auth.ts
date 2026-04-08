import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private apiUrl = 'https://localhost:7147/api/auth';

  loggedInSignal = signal<boolean>(this.checkToken());

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  private checkToken(): boolean {
    const token = localStorage.getItem('token');
    return !!token && token !== 'undefined' && token !== null;
  }

  register(obj: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, obj);
  }

  login(obj: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, obj);
  }

  saveSession(token: string, refreshToken: string, role: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('role', role);

    this.loggedInSignal.set(true);
  }

  logout() {
    localStorage.clear();

    this.loggedInSignal.set(false);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return this.checkToken();
  }
}
