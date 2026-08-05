import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EmployeeRecord } from '../../models/employee.model';
import { StaffProfile } from '../../models/staff.model';
import { Employee } from '../../services/employee';
import { StaffData } from '../../services/staff-data';
import { ColumnDefinition } from '../data-table/data-table.component';

export interface StaffRow {
  id: number;
  name: string;
  mobile: string;
  email: string;
  division: string;
  designation: string;
  salary: number;
  [key: string]: any;
}

@Component({
  selector: 'app-staff-list',
  standalone: false,
  templateUrl: './staff-list.html',
  styleUrl: './staff-list.scss',
})
export class StaffList implements OnInit {
  employees: EmployeeRecord[] = [];
  profiles: StaffProfile[] = [];

  tableColumns: ColumnDefinition[] = [
    { field: 'id', header: 'ID', sortable: true, filterable: true, width: '70px' },
    { field: 'name', header: 'Staff Name', sortable: true, filterable: true },
    { field: 'email', header: 'Email Address', sortable: true, filterable: true },
    { field: 'mobile', header: 'Mobile Number', sortable: true, filterable: true },
    { field: 'division', header: 'Division', sortable: true, filterable: true },
    { field: 'designation', header: 'Designation', sortable: true, filterable: true },
    { field: 'salary', header: 'Monthly Salary', sortable: true, filterable: true, type: 'currency' },
  ];

  constructor(
    private employeeService: Employee,
    private staffData: StaffData,
    private router: Router,
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

  get staffRows(): StaffRow[] {
    return this.employees.map((employee) => {
      const profile = this.profiles.find((item) => item.employeeId === employee.id);
      return {
        id: employee.id,
        name: employee.name,
        mobile: employee.mobile ?? 'N/A',
        email: employee.email,
        division: profile?.division ?? 'Operations',
        designation: profile?.designation ?? 'Associate',
        salary: employee.salary ?? 0,
      };
    });
  }

  onRowClick(row: StaffRow): void {
    this.router.navigate(['/hr/staff', row.id]);
  }

  editEmployee(id: number): void {
    this.router.navigate(['/hr/staff-master'], { queryParams: { employeeId: id } });
  }
}
