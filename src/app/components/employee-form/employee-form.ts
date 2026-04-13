import { Component,Input, Output, EventEmitter } from '@angular/core';
import { Department, EmployeeUpsertPayload, EMPTY_EMPLOYEE } from '../../models/employee.model';

@Component({
  selector: 'app-employee-form',
  standalone: false,
  templateUrl: './employee-form.html',
  styleUrl: './employee-form.scss',
})
export class EmployeeForm {
  @Input() currentEmployee: EmployeeUpsertPayload = { ...EMPTY_EMPLOYEE };
  @Input() departments: Department[] = [];
  @Input() isEditing = false;

  @Output() onSave = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();

  save(): void {
    this.onSave.emit();
  }

  cancel(): void {
    this.onCancel.emit();
  }
}
