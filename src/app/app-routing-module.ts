import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmployeeTest } from './employee-test/employee-test';

const routes: Routes = [
  {
    path: 'employees',
    component: EmployeeTest,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
