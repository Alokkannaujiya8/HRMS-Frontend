import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
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

@NgModule({
  declarations: [App, EmployeeTest, Login, Register, Dashboard, EmployeeForm, EmployeeList, PhotoUpload, ],
  imports: [BrowserModule, AppRoutingModule, FormsModule],
  providers: [provideHttpClient(withInterceptors([authInterceptor]))],
  bootstrap: [App],
})
export class AppModule {}
