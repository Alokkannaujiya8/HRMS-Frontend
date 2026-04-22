import { Component,Input, Output, EventEmitter } from '@angular/core';
import { Department, EmployeeUpsertPayload, EMPTY_EMPLOYEE } from '../../models/employee.model';
import { buildFileUrl } from '../../utils/file-url';

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
    this.onPhotoFileChange.emit(file);
  }

  onDocumentChange(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    const file = target?.files?.[0];
    this.selectedDocumentName = file?.name ?? '';
    this.onDocumentFileChange.emit(file);
  }

  removeDocument(): void {
    this.selectedDocumentName = '';
    this.onDocumentFileChange.emit(undefined);
  }

  getDocumentUrl(): string {
    return buildFileUrl(this.currentEmployee.documentUrl);
  }

  save(): void {
    this.onSave.emit();
  }

  cancel(): void {
    this.onCancel.emit();
  }
}
