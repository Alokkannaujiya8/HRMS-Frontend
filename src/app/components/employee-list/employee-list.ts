import { Component, Input, Output, EventEmitter } from '@angular/core';
import { EmployeeRecord } from '../../models/employee.model';
import { buildFileUrl } from '../../utils/file-url';
import { ToastService } from '../../services/toast.service';
import { HrOperations } from '../../services/hr-operations';

export interface CredentialSummary {
  employeeId: string;
  username: string;
  tempPassword: string;
  loginUrl: string;
  email: string;
  name: string;
}

@Component({
  selector: 'app-employee-list',
  standalone: false,
  templateUrl: './employee-list.html',
  styleUrl: './employee-list.scss',
})
export class EmployeeList {
  @Input() employees: EmployeeRecord[] = [];
  @Input() userRole: string = '';

  @Output() onEdit = new EventEmitter<EmployeeRecord>();
  @Output() onDelete = new EventEmitter<number>();

  searchText: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 5;

  activeCredentialsModal: CredentialSummary | null = null;

  constructor(
    private toastService: ToastService,
    private hrOps: HrOperations
  ) {}

  get filteredEmployees() {
    if (!this.searchText) return this.employees;
    const search = this.searchText.trim().toLowerCase();
    return this.employees.filter((emp) =>
      emp.name.toLowerCase().includes(search) || emp.email.toLowerCase().includes(search),
    );
  }

  get paginatedEmployees() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredEmployees.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages() { return Math.ceil(this.filteredEmployees.length / this.itemsPerPage); }
  nextPage() { if (this.currentPage < this.totalPages) this.currentPage++; }
  prevPage() { if (this.currentPage > 1) this.currentPage--; }
  onSearchChange() { this.currentPage = 1; }

  edit(emp: EmployeeRecord) { this.onEdit.emit(emp); }

  delete(id: number | null | undefined) {
    if (typeof id === 'number') {
      this.onDelete.emit(id);
    }
  }

  // Feature: Reveal & Reset Credentials for HR
  revealCredentials(emp: EmployeeRecord): void {
    const username = emp.email.split('@')[0].toLowerCase();
    const empId = `EMP000${emp.id || 245}`;
    const tempPassword = 'Neo@12345'; // Standard reset password

    this.activeCredentialsModal = {
      employeeId: empId,
      username: username,
      tempPassword: tempPassword,
      loginUrl: 'https://company.com/login',
      email: emp.email,
      name: emp.name
    };
  }

  closeCredentialsModal(): void {
    this.activeCredentialsModal = null;
  }

  copyCredentialsText(): void {
    if (!this.activeCredentialsModal) return;
    const text = `Welcome to NeoHR\n\nEmployee ID: ${this.activeCredentialsModal.employeeId}\nUsername: ${this.activeCredentialsModal.username}\nPassword: ${this.activeCredentialsModal.tempPassword}\n\nLogin URL: ${this.activeCredentialsModal.loginUrl}`;
    
    navigator.clipboard.writeText(text).then(() => {
      this.toastService.showSuccess('Credentials copied to clipboard!', 'Copied');
    }).catch(() => {
      this.toastService.showInfo('Credentials summary ready for copy.', 'Credentials Ready');
    });
  }

  resendEmailNotification(): void {
    if (!this.activeCredentialsModal) return;
    const emailSubject = 'Welcome to NeoHR - Your Login Credentials';
    const emailBody = `Welcome to NeoHR\n\nUsername :\n${this.activeCredentialsModal.username}\n\nPassword :\n${this.activeCredentialsModal.tempPassword}\n\nLogin URL\n${this.activeCredentialsModal.loginUrl}`;

    this.hrOps.queueEmail(this.activeCredentialsModal.email, emailSubject, emailBody, 'SMTP');
    this.toastService.showSuccess(`Welcome email resent to ${this.activeCredentialsModal.email}`, 'Email Dispatched');
  }

  getPhotoUrl(photoUrl: string | null): string {
    return buildFileUrl(photoUrl) || 'assets/dummy-user.png';
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement | null;
    if (!img || img.src.endsWith('/assets/dummy-user.png')) {
      return;
    }
    img.src = 'assets/dummy-user.png';
  }
}
