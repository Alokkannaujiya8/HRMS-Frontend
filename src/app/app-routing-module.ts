import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmployeeTest } from './employee-test/employee-test';
import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { authGuard } from './guards/auth-guard';
import { roleChildGuard, roleGuard } from './guards/role-guard';
import { Attendance } from './components/attendance/attendance';
import { LeaveManagement } from './components/leave-management/leave-management';
import { AuditTrail } from './components/audit-trail/audit-trail';
import { Reports } from './components/reports/reports';
import { Notifications } from './components/notifications/notifications';
import { DepartmentManagement } from './components/department-management/department-management';
import { AccessDenied } from './components/access-denied/access-denied';
import { MyPayroll } from './components/my-payroll/my-payroll';
import { HrShell } from './components/hr-shell/hr-shell';
import { HrDashboardHome } from './components/hr-dashboard-home/hr-dashboard-home';
import { StaffList } from './components/staff-list/staff-list';
import { EmployeeDetails } from './components/employee-details/employee-details';
import { SalaryManagement } from './components/salary-management/salary-management';
import { StaffMaster } from './components/staff-master/staff-master';
import { MasterDataComponent } from './components/master-data/master-data';
import { StaffBankDetails } from './components/staff-bank-details/staff-bank-details';
import { EmployeeShell } from './components/employee-shell/employee-shell';
import { AssetManagementComponent } from './components/asset-management/asset-management';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: Login,
  },
  {
    path: 'register',
    component: Register,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Admin'] },
  },
  {
    path: 'employees',
    component: EmployeeTest,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Admin', 'HR'] },
  },
  {
    path: 'attendance',
    component: Attendance,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Admin', 'HR'] },
  },
  {
    path: 'leave-management',
    component: LeaveManagement,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Admin', 'HR'] },
  },
  {
    path: 'audit-trail',
    component: AuditTrail,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Admin', 'HR'] },
  },
  {
    path: 'reports',
    component: Reports,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Admin', 'HR'] },
  },
  {
    path: 'notifications',
    component: Notifications,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Admin', 'HR'] },
  },
  {
    path: 'departments',
    component: DepartmentManagement,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Admin'] },
  },
  {
    path: 'access-denied',
    component: AccessDenied,
    canActivate: [authGuard],
  },
  {
    path: 'my-payroll',
    component: MyPayroll,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Employee'] },
  },
  {
    path: 'hr',
    component: HrShell,
    canActivate: [authGuard, roleGuard],
    canActivateChild: [roleChildGuard],
    data: { roles: ['Admin', 'HR'] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: HrDashboardHome, data: { roles: ['Admin', 'HR'] } },
      { path: 'employees', component: EmployeeTest, data: { roles: ['Admin', 'HR'] } },
      { path: 'attendance', component: Attendance, data: { roles: ['Admin', 'HR'] } },
      { path: 'leave-management', component: LeaveManagement, data: { roles: ['Admin', 'HR'] } },
      { path: 'audit-trail', component: AuditTrail, data: { roles: ['Admin', 'HR'] } },
      { path: 'reports', component: Reports, data: { roles: ['Admin', 'HR'] } },
      { path: 'notifications', component: Notifications, data: { roles: ['Admin', 'HR'] } },
      { path: 'my-payroll', component: MyPayroll, data: { roles: ['Admin', 'HR'] } },
      { path: 'staff-list', component: StaffList, data: { roles: ['Admin', 'HR'] } },
      { path: 'staff/:id', component: EmployeeDetails, data: { roles: ['Admin', 'HR'] } },
      { path: 'salary-management', component: SalaryManagement, data: { roles: ['Admin', 'HR'] } },
      { path: 'staff-bank-details', component: StaffBankDetails, data: { roles: ['Admin', 'HR'] } },
      { path: 'staff-master', component: StaffMaster, data: { roles: ['Admin', 'HR'] } },
      { path: 'master-data', component: MasterDataComponent, data: { roles: ['Admin', 'HR'] } },
      { path: 'assets', component: AssetManagementComponent, data: { roles: ['Admin', 'HR'] } },
    ],
  },
  {
    path: 'employee',
    component: EmployeeShell,
    canActivate: [authGuard, roleGuard],
    canActivateChild: [roleChildGuard],
    data: { roles: ['Employee'] },
    children: [
      { path: '', redirectTo: 'attendance', pathMatch: 'full' },
      { path: 'attendance', component: Attendance, data: { roles: ['Employee'] } },
      { path: 'leave-management', component: LeaveManagement, data: { roles: ['Employee'] } },
      { path: 'reports', component: Reports, data: { roles: ['Employee'] } },
      { path: 'notifications', component: Notifications, data: { roles: ['Employee'] } },
      { path: 'my-payroll', component: MyPayroll, data: { roles: ['Employee'] } },
    ],
  },
  { path: '**', redirectTo: 'login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
