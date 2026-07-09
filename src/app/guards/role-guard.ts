import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { UserRole } from '../models/auth.model';
import { Auth } from '../services/auth';

const canOpenRoute = (allowedRoles: UserRole[] | undefined) => {
  const authService = inject(Auth);
  const router = inject(Router);

  if (!allowedRoles || allowedRoles.length === 0 || authService.hasRole(allowedRoles)) {
    return true;
  }

  return router.createUrlTree(['/access-denied']);
};

export const roleGuard: CanActivateFn = (route) => {
  return canOpenRoute(route.data['roles'] as UserRole[] | undefined);
};

export const roleChildGuard: CanActivateChildFn = (childRoute) => {
  return canOpenRoute(childRoute.data['roles'] as UserRole[] | undefined);
};
