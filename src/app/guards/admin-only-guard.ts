import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Auth } from '../services/auth';

export const adminOnlyGuard: CanActivateFn = () => {
  const router = inject(Router);
  const authService = inject(Auth);

  if (authService.hasRole(['Admin'])) {
    return true;
  }

  return router.createUrlTree(['/access-denied']);
};
