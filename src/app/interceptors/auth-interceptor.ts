import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { Auth } from '../services/auth';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(Auth);
  const token = authService.getAccessToken();

  const authRequest = token
    ? req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      })
    : req;

  return next(authRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      const refreshToken = authService.getRefreshToken();
      if (error.status !== 401 || !refreshToken || req.url.includes('/api/auth/refresh-token')) {
        return throwError(() => error);
      }

      if (!isRefreshing) {
        isRefreshing = true;
        refreshTokenSubject.next(null);

        return authService.refreshAccessToken().pipe(
          switchMap((response) => {
            isRefreshing = false;
            authService.updateTokens(response.token, response.refreshToken, response.role);
            refreshTokenSubject.next(response.token);

            const retryRequest = req.clone({
              setHeaders: { Authorization: `Bearer ${response.token}` },
            });
            return next(retryRequest);
          }),
          catchError((refreshError: HttpErrorResponse) => {
            isRefreshing = false;
            authService.logout();
            router.navigate(['/login']);
            return throwError(() => refreshError);
          }),
        );
      }

      return refreshTokenSubject.pipe(
        filter((newToken) => !!newToken),
        take(1),
        switchMap((newToken) => {
          const retryRequest = req.clone({
            setHeaders: { Authorization: `Bearer ${newToken}` },
          });
          return next(retryRequest);
        }),
      );
    }),
  );
};
