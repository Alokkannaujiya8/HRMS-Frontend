import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const employeeOnlyGuard: CanActivateFn = () => {
  const router = inject(Router);
  const role = (localStorage.getItem('role') ?? '').trim().toLowerCase();

  if (role === 'employee') {
    return true;
  }

  return router.createUrlTree(['/access-denied']);
};
