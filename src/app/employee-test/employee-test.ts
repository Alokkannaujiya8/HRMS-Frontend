import { Component, OnInit } from '@angular/core';
import { forkJoin, map, Observable, of } from 'rxjs';
import { UserRole } from '../models/auth.model';
import {
  Department,
  EmployeeRecord,
  EmployeeUpsertPayload,
  EMPTY_EMPLOYEE,
} from '../models/employee.model';
import { Employee } from '../services/employee';
import { HrOperations } from '../services/hr-operations';

@Component({
  selector: 'app-employee-test',
  standalone: false,
  templateUrl: './employee-test.html',
  styleUrl: './employee-test.scss',
})
export class EmployeeTest implements OnInit {
  private readonly emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  isLoading = false;
  successMessage = '';
  errorMessage = '';
  userRole: UserRole = 'Employee';
  selectedPhotoFile: File | null = null;
  selectedDocumentFile: File | null = null;
  private employeeBeforeEdit: EmployeeRecord | null = null;

  constructor(
    private service: Employee,
    private hrOps: HrOperations,
  ) {}

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
    this.employeeBeforeEdit = { ...emp };
    if (this.currentEmployee.joinDate) {
      this.currentEmployee.joinDate = new Date(this.currentEmployee.joinDate).toISOString().split('T')[0];
    }
    this.isEditing = true;
  }

  saveEmployee(): void {
    if (this.isLoading) {
      return;
    }

    const wasEditing = this.isEditing;
    this.errorMessage = '';

    const normalizedEmail = this.currentEmployee.email?.trim() ?? '';
    if (!this.emailPattern.test(normalizedEmail)) {
      this.errorMessage = 'Please enter a valid email address before saving.';
      return;
    }

    this.isLoading = true;

    this.uploadPendingFiles().subscribe({
      next: () => {
        const payload = this.buildApiPayload(this.currentEmployee);
        const action = this.isEditing
          ? this.service.updateEmployee(payload)
          : this.service.addEmployee(payload);

        action.subscribe({
          next: () => {
            const changedBy = this.userRole;
            this.logEmployeeActions(wasEditing, changedBy);
            this.loadEmployees();
            this.resetForm();
            this.showMessage(
              wasEditing ? 'Employee updated successfully!' : 'Employee added and Welcome Email sent!',
            );
            this.isLoading = false;
          },
          error: (err: Error) => {
            this.errorMessage = err.message;
            this.isLoading = false;
          },
        });
      },
      error: (err: Error) => {
        this.errorMessage = err.message;
        this.isLoading = false;
      },
    });
  }

  deleteEmployee(id: number): void {
    if (confirm('Are you sure you want to delete this employee?')) {
      this.service.deleteEmployee(id).subscribe({
        next: () => {
          this.hrOps.addAudit({
            action: 'Employee Deleted',
            module: 'Employee',
            changedBy: this.userRole,
            details: `Employee id ${id} deleted by ${this.userRole}.`,
          });
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
    this.employeeBeforeEdit = null;
    this.selectedPhotoFile = null;
    this.selectedDocumentFile = null;
    this.isLoading = false;
  }

  onPhotoSelected(file: File | undefined): void {
    if (file) {
      this.selectedPhotoFile = file;
      return;
    }

    this.selectedPhotoFile = null;
    this.currentEmployee.photoUrl = '';
  }

  onDocumentSelected(file: File | undefined): void {
    if (file) {
      this.selectedDocumentFile = file;
      return;
    }

    this.selectedDocumentFile = null;
    this.currentEmployee.documentUrl = '';
  }

  private uploadPendingFiles(): Observable<void> {
    const uploadTasks: Observable<void>[] = [];

    if (this.selectedPhotoFile) {
      uploadTasks.push(
        this.service.uploadPhoto(this.selectedPhotoFile).pipe(
          map((response) => {
            const url = this.extractFileUrl(response);
            if (!url) {
              throw new Error('Photo upload completed but no photo URL was returned.');
            }
            this.currentEmployee.photoUrl = url;
            this.selectedPhotoFile = null;
          }),
        ),
      );
    }

    if (this.selectedDocumentFile) {
      uploadTasks.push(
        this.service.uploadDocument(this.selectedDocumentFile).pipe(
          map((response) => {
            const url = this.extractFileUrl(response);
            if (!url) {
              throw new Error('Document upload completed but no document URL was returned.');
            }
            this.currentEmployee.documentUrl = url;
            this.selectedDocumentFile = null;
          }),
        ),
      );
    }

    if (uploadTasks.length === 0) {
      return of(void 0);
    }

    return forkJoin(uploadTasks).pipe(map(() => void 0));
  }

  private extractFileUrl(response: Record<string, unknown>): string {
    const candidateKeys = ['photoUrl', 'documentUrl', 'fileUrl', 'url', 'path'];

    for (const key of candidateKeys) {
      const value = response[key];
      if (typeof value === 'string' && value.trim().length > 0) {
        return value;
      }
    }

    return '';
  }

  private showMessage(msg: string): void {
    this.errorMessage = '';
    this.successMessage = msg;
    setTimeout(() => (this.successMessage = ''), 3000);
  }

  // Backward compatibility with old template/event names.
  onNewPhotoSelected(file: File | undefined): void {
    this.onPhotoSelected(file);
  }

  onSave(): void {
    this.saveEmployee();
  }

  private buildApiPayload(employee: EmployeeUpsertPayload): EmployeeUpsertPayload {
    const normalizedJoinDate = employee.joinDate?.trim()
      ? employee.joinDate
      : null;

    return {
      ...employee,
      email: employee.email?.trim() ?? '',
      mobile: employee.mobile?.trim() ? employee.mobile.trim() : null,
      joinDate: normalizedJoinDate,
      photoUrl: employee.photoUrl?.trim() ? employee.photoUrl.trim() : null,
      documentUrl: employee.documentUrl?.trim() ? employee.documentUrl.trim() : null,
    };
  }

  private logEmployeeActions(wasEditing: boolean, changedBy: string): void {
    if (!wasEditing) {
      this.hrOps.addAudit({
        action: 'Employee Added',
        module: 'Employee',
        changedBy,
        details: `${this.currentEmployee.name} added by ${changedBy}.`,
      });
      this.hrOps.queueEmail(
        this.currentEmployee.email,
        'Welcome to HR Portal',
        `Hello ${this.currentEmployee.name}, your employee profile is now active.`,
        'SendGrid',
      );
      this.hrOps.addAudit({
        action: 'Welcome Email Sent',
        module: 'Notification',
        changedBy,
        details: `Welcome email triggered for ${this.currentEmployee.email}.`,
      });
      return;
    }

    this.hrOps.addAudit({
      action: 'Employee Updated',
      module: 'Employee',
      changedBy,
      details: `${this.currentEmployee.name} profile updated by ${changedBy}.`,
    });

    if (
      this.employeeBeforeEdit &&
      (this.employeeBeforeEdit.salary ?? 0) !== (this.currentEmployee.salary ?? 0)
    ) {
      this.hrOps.addAudit({
        action: 'Salary Updated',
        module: 'Employee',
        changedBy,
        details: `Salary updated by ${changedBy}: ${this.employeeBeforeEdit.salary ?? 0} -> ${this.currentEmployee.salary ?? 0}.`,
      });
    }
  }
}
