import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EmployeeRecord } from '../../models/employee.model';
import { StaffProfile } from '../../models/staff.model';
import { Employee } from '../../services/employee';
import { StaffData } from '../../services/staff-data';

interface StaffRow {
  id: number;
  name: string;
  mobile: string;
  email: string;
  division: string;
  designation: string;
  salary: number;
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
  search = '';
  divisionFilter = '';
  designationFilter = '';

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

  get filteredRows(): StaffRow[] {
    return this.staffRows.filter((row) => {
      const query = this.search.trim().toLowerCase();
      const matchesSearch =
        !query ||
        row.name.toLowerCase().includes(query) ||
        row.email.toLowerCase().includes(query) ||
        row.mobile.toLowerCase().includes(query);
      const matchesDivision = !this.divisionFilter || row.division === this.divisionFilter;
      const matchesDesignation = !this.designationFilter || row.designation === this.designationFilter;
      return matchesSearch && matchesDivision && matchesDesignation;
    });
  }

  get divisions(): string[] {
    return [...new Set(this.staffRows.map((row) => row.division))];
  }

  get designations(): string[] {
    return [...new Set(this.staffRows.map((row) => row.designation))];
  }

  viewProfile(id: number): void {
    this.router.navigate(['/hr/staff', id]);
  }

  editEmployee(id: number): void {
    this.router.navigate(['/hr/staff-master'], { queryParams: { employeeId: id } });
  }
}
