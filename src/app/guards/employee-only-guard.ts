import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Auth } from '../services/auth';

export const employeeOnlyGuard: CanActivateFn = () => {
  const router = inject(Router);
  const authService = inject(Auth);

  if (authService.hasRole(['Employee'])) {
    return true;
  }

  return router.createUrlTree(['/access-denied']);
};
