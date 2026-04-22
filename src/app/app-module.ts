import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { EmployeeTest } from './employee-test/employee-test';
import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { authInterceptor } from './interceptors/auth-interceptor';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { Dashboard } from './components/dashboard/dashboard';
import { EmployeeForm } from './components/employee-form/employee-form';
import { EmployeeList } from './components/employee-list/employee-list';
import { PhotoUpload } from './components/photo-upload/photo-upload';
import { Attendance } from './components/attendance/attendance';
import { LeaveManagement } from './components/leave-management/leave-management';
import { AuditTrail } from './components/audit-trail/audit-trail';
import { Reports } from './components/reports/reports';
import { Notifications } from './components/notifications/notifications';
import { DepartmentManagement } from './components/department-management/department-management';
import { AccessDenied } from './components/access-denied/access-denied';
import { MyPayroll } from './components/my-payroll/my-payroll';
import { HasPermissionDirective } from './directives/has-permission.directive';
import { HrShell } from './components/hr-shell/hr-shell';
import { HrDashboardHome } from './components/hr-dashboard-home/hr-dashboard-home';
import { StaffList } from './components/staff-list/staff-list';
import { EmployeeDetails } from './components/employee-details/employee-details';
import { SalaryManagement } from './components/salary-management/salary-management';
import { StaffMaster } from './components/staff-master/staff-master';
import { MasterDataComponent } from './components/master-data/master-data';
import { StaffBankDetails } from './components/staff-bank-details/staff-bank-details';
import { EmployeeShell } from './components/employee-shell/employee-shell';

@NgModule({
  declarations: [
    App,
    EmployeeTest,
    Login,
    Register,
    Dashboard,
    EmployeeForm,
    EmployeeList,
    PhotoUpload,
    Attendance,
    LeaveManagement,
    AuditTrail,
    Reports,
    Notifications,
    DepartmentManagement,
    AccessDenied,
    MyPayroll,
    HasPermissionDirective,
    HrShell,
    HrDashboardHome,
    StaffList,
    EmployeeDetails,
    SalaryManagement,
    StaffBankDetails,
    StaffMaster,
    MasterDataComponent,
    EmployeeShell,
  ],
  imports: [BrowserModule, AppRoutingModule, FormsModule, ReactiveFormsModule],
  providers: [provideHttpClient(withInterceptors([authInterceptor]))],
  bootstrap: [App],
})
export class AppModule {}
