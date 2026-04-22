import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmployeeTest } from './employee-test/employee-test';
import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { authGuard } from './guards/auth-guard';
import { adminHrGuard } from './guards/admin-hr-guard';
import { adminOnlyGuard } from './guards/admin-only-guard';
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
import { employeeOnlyGuard } from './guards/employee-only-guard';

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
    canActivate: [authGuard, adminHrGuard],
  },
  {
    path: 'employees',
    component: EmployeeTest,
    canActivate: [authGuard],
  },
  {
    path: 'attendance',
    component: Attendance,
    canActivate: [authGuard],
  },
  {
    path: 'leave-management',
    component: LeaveManagement,
    canActivate: [authGuard],
  },
  {
    path: 'audit-trail',
    component: AuditTrail,
    canActivate: [authGuard],
  },
  {
    path: 'reports',
    component: Reports,
    canActivate: [authGuard],
  },
  {
    path: 'notifications',
    component: Notifications,
    canActivate: [authGuard],
  },
  {
    path: 'departments',
    component: DepartmentManagement,
    canActivate: [authGuard, adminOnlyGuard],
  },
  {
    path: 'access-denied',
    component: AccessDenied,
    canActivate: [authGuard],
  },
  {
    path: 'my-payroll',
    component: MyPayroll,
    canActivate: [authGuard],
  },
  {
    path: 'hr',
    component: HrShell,
    canActivate: [authGuard, adminHrGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: HrDashboardHome },
      { path: 'employees', component: EmployeeTest },
      { path: 'attendance', component: Attendance },
      { path: 'leave-management', component: LeaveManagement },
      { path: 'audit-trail', component: AuditTrail },
      { path: 'reports', component: Reports },
      { path: 'notifications', component: Notifications },
      { path: 'my-payroll', component: MyPayroll },
      { path: 'staff-list', component: StaffList },
      { path: 'staff/:id', component: EmployeeDetails },
      { path: 'salary-management', component: SalaryManagement },
      { path: 'staff-bank-details', component: StaffBankDetails },
      { path: 'staff-master', component: StaffMaster },
      { path: 'master-data', component: MasterDataComponent },
    ],
  },
  {
    path: 'employee',
    component: EmployeeShell,
    canActivate: [authGuard, employeeOnlyGuard],
    children: [
      { path: '', redirectTo: 'attendance', pathMatch: 'full' },
      { path: 'attendance', component: Attendance },
      { path: 'leave-management', component: LeaveManagement },
      { path: 'reports', component: Reports },
      { path: 'notifications', component: Notifications },
      { path: 'my-payroll', component: MyPayroll },
    ],
  },
  { path: '**', redirectTo: 'login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
