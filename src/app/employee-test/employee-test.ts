import { Component, OnInit } from '@angular/core';
import { Employee } from '../services/employee';
import { UserRole } from '../models/auth.model';
import {
  Department,
  EmployeeRecord,
  EmployeeUpsertPayload,
  EMPTY_EMPLOYEE,
} from '../models/employee.model';

@Component({
  selector: 'app-employee-test',
  standalone: false,
  templateUrl: './employee-test.html',
  styleUrl: './employee-test.scss',
})
export class EmployeeTest implements OnInit {
  employees: EmployeeRecord[] = [];
  departments: Department[] = [
    { id: 1, name: 'HR' },
    { id: 2, name: 'IT' },
    { id: 3, name: 'Finance' },
    { id: 4, name: 'Sales' },
    { id: 5, name: 'Admin' },
  ];
  currentEmployee: EmployeeUpsertPayload = { ...EMPTY_EMPLOYEE };

  isEditing = false;
  successMessage = '';
  errorMessage = '';
  userRole: UserRole = 'Employee';

  constructor(private service: Employee) {}

  ngOnInit(): void {
    const storedRole = localStorage.getItem('role');
    if (storedRole === 'Admin' || storedRole === 'HR' || storedRole === 'Employee') {
      this.userRole = storedRole;
    }
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.service.getEmployees().subscribe({
      next: (data) => {
        this.employees = data ?? [];
      },
      error: (err: Error) => {
        this.errorMessage = err.message;
      },
    });
  }

  editEmployee(emp: EmployeeRecord): void {
    this.currentEmployee = { ...emp };
    if (this.currentEmployee.joinDate) {
      this.currentEmployee.joinDate = new Date(this.currentEmployee.joinDate).toISOString().split('T')[0];
    }
    this.isEditing = true;
  }

  saveEmployee(): void {
    const wasEditing = this.isEditing;
    const action = this.isEditing
      ? this.service.updateEmployee(this.currentEmployee)
      : this.service.addEmployee(this.currentEmployee);

    action.subscribe({
      next: () => {
        this.loadEmployees();
        this.resetForm();
        this.showMessage(wasEditing ? 'Employee updated successfully!' : 'Employee added successfully!');
      },
      error: (err: Error) => {
        this.errorMessage = err.message;
      },
    });
  }

  deleteEmployee(id: number): void {
    if (confirm('Are you sure you want to delete this employee?')) {
      this.service.deleteEmployee(id).subscribe({
        next: () => {
          this.loadEmployees();
          this.showMessage('Employee deleted successfully!');
        },
        error: (err: Error) => {
          this.errorMessage = err.message;
        },
      });
    }
  }

  resetForm(): void {
    this.currentEmployee = { ...EMPTY_EMPLOYEE };
    this.isEditing = false;
  }

  private showMessage(msg: string): void {
    this.errorMessage = '';
    this.successMessage = msg;
    setTimeout(() => (this.successMessage = ''), 3000);
  }
}
