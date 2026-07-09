import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Auth } from '../services/auth';

export const adminHrGuard: CanActivateFn = () => {
  const router = inject(Router);
  const authService = inject(Auth);

  if (authService.hasRole(['Admin', 'HR'])) {
    return true;
  }

  return router.createUrlTree(['/access-denied']);
};
