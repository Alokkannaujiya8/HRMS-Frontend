import { Permission, UserRole } from '../models/auth.model';

export const ROLE_LANDING_ROUTES: Record<UserRole, string> = {
  Admin: '/hr/dashboard',
  HR: '/hr/dashboard',
  Employee: '/employee',
};

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  Admin: [
    'CanManageUsers',
    'CanManageDepartments',
    'CanManageEmployees',
    'CanManageAttendance',
    'CanManageLeave',
    'CanViewAudit',
    'CanViewReports',
    'CanManagePayroll',
    'CanViewSalary',
    'CanViewOwnAttendance',
    'CanApplyLeave',
    'CanViewOwnReports',
    'CanViewNotifications',
  ],
  HR: [
    'CanManageEmployees',
    'CanManageAttendance',
    'CanManageLeave',
    'CanViewAudit',
    'CanViewReports',
    'CanManagePayroll',
    'CanViewSalary',
    'CanViewNotifications',
  ],
  Employee: [
    'CanViewOwnAttendance',
    'CanApplyLeave',
    'CanViewOwnReports',
    'CanViewSalary',
    'CanViewNotifications',
  ],
};
