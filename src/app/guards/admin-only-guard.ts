import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const adminOnlyGuard: CanActivateFn = () => {
  const router = inject(Router);
  const role = localStorage.getItem('role')?.trim().toLowerCase();

  if (role === 'admin') {
    return true;
  }

  return router.createUrlTree(['/access-denied']);
};
