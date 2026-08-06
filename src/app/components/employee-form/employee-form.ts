import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Department, EmployeeUpsertPayload, EMPTY_EMPLOYEE } from '../../models/employee.model';
import { buildFileUrl } from '../../utils/file-url';
import { ToastService } from '../../services/toast.service';
import { HrOperations } from '../../services/hr-operations';

@Component({
  selector: 'app-employee-form',
  standalone: false,
  templateUrl: './employee-form.html',
  styleUrl: './employee-form.scss',
})
export class EmployeeForm {
  private readonly emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  @Input() currentEmployee: EmployeeUpsertPayload = { ...EMPTY_EMPLOYEE };
  @Input() departments: Department[] = [];
  @Input() isEditing = false;
  @Input() isLoading = false;

  @Output() onSave = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();
  @Output() onPhotoFileChange = new EventEmitter<File | undefined>();
  @Output() onDocumentFileChange = new EventEmitter<File | undefined>();

  selectedDocumentName = '';
  photoPreviewUrl: string | null = null;

  rolesList = ['Employee', 'Manager', 'HR', 'Admin'];
  shiftsList = [
    'Day Shift (09:00 AM - 06:00 PM)',
    'Night Shift (09:00 PM - 06:00 AM)',
    'Flexible Shift'
  ];

  constructor(
    private toastService: ToastService,
    private hrOps: HrOperations
  ) {}

  get emailValue(): string {
    return this.currentEmployee.email?.trim() ?? '';
  }

  get isEmailValid(): boolean {
    if (!this.emailValue) {
      return false;
    }
    return this.emailPattern.test(this.emailValue);
  }

  get canSave(): boolean {
    return !this.isLoading &&
      !!this.currentEmployee.name?.trim() &&
      this.isEmailValid &&
      !!this.currentEmployee.departmentId;
  }

  onPhotoSelected(file: File | undefined): void {
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.photoPreviewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      this.photoPreviewUrl = null;
    }
    this.onPhotoFileChange.emit(file);
  }

  onDocumentChange(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    const file = target?.files?.[0];
    if (file) {
      this.selectedDocumentName = file.name;
      this.toastService.showInfo(`Document attached: ${file.name}`, 'File Attached');
    } else {
      this.selectedDocumentName = '';
    }
    this.onDocumentFileChange.emit(file);
  }

  removeDocument(): void {
    this.selectedDocumentName = '';
    this.onDocumentFileChange.emit(undefined);
    this.toastService.showWarning('Document attachment removed', 'File Removed');
  }

  getDocumentUrl(): string {
    return buildFileUrl(this.currentEmployee.documentUrl);
  }

  save(): void {
    if (!this.canSave) {
      this.toastService.showError('Please complete mandatory fields correctly.', 'Validation Error');
      return;
    }

    const randomDigits = Math.floor(100 + Math.random() * 900);
    const empId = `EMP000${randomDigits}`; // e.g. EMP000245
    const username = this.emailValue.split('@')[0].toLowerCase(); // e.g. alok
    const tempPassword = 'Neo@12345'; // Default temporary password pattern

    if (!this.isEditing && this.currentEmployee.createLogin) {
      const emailSubject = 'Welcome to NeoHR';
      const emailBody = `Welcome to NeoHR\n\nUsername :\n${username}\n\nPassword :\n${tempPassword}\n\nLogin URL\nhttps://company.com/login`;

      this.hrOps.queueEmail(this.emailValue, emailSubject, emailBody, 'SMTP');

      this.toastService.showSuccess(
        `Welcome email sent to ${this.emailValue}! Username: ${username} | Temp Pass: ${tempPassword}`,
        'Welcome to NeoHR Email Dispatched'
      );
    } else {
      this.toastService.showSuccess(
        this.isEditing ? 'Employee record updated successfully!' : 'New employee registered successfully!',
        'Record Saved'
      );
    }

    this.onSave.emit();
  }

  cancel(): void {
    this.onCancel.emit();
  }
}
