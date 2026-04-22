import { Component, OnInit } from '@angular/core';
import { EmployeeRecord } from '../../models/employee.model';
import { StaffProfile } from '../../models/staff.model';
import { Employee } from '../../services/employee';
import { StaffData } from '../../services/staff-data';

@Component({
  selector: 'app-hr-dashboard-home',
  standalone: false,
  templateUrl: './hr-dashboard-home.html',
  styleUrl: './hr-dashboard-home.scss',
})
export class HrDashboardHome implements OnInit {
  employees: EmployeeRecord[] = [];
  profiles: StaffProfile[] = [];

  constructor(
    private employeeService: Employee,
    private staffData: StaffData,
  ) {}

  ngOnInit(): void {
    this.employeeService.getEmployees().subscribe({
      next: (employees) => {
        this.employees = employees ?? [];
        this.staffData.syncEmployees(this.employees);
        this.profiles = this.staffData.getProfiles();
      },
    });
  }

  get totalEmployees(): number {
    return this.employees.length;
  }

  get aadhaarPending(): number {
    return this.profiles.filter((profile) => !profile.aadhaarVerified).length;
  }

  get activeEmployees(): number {
    return this.profiles.filter((profile) => profile.status === 'Active').length;
  }
}
