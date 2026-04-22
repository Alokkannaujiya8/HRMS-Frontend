import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const adminHrGuard: CanActivateFn = () => {
  const router = inject(Router);
  const role = localStorage.getItem('role')?.trim().toLowerCase();

  if (role === 'admin' || role === 'hr') {
    return true;
  }

  return router.createUrlTree(['/access-denied']);
};
