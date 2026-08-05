import { Component, Input, Output, EventEmitter } from '@angular/core';

export interface EmployeeGlassCardItem {
  id: number;
  name: string;
  email: string;
  mobile?: string;
  department: string;
  designation?: string;
  status: 'Active' | 'On Leave' | 'Inactive' | string;
  photoUrl?: string;
  salary?: number;
}

@Component({
  selector: 'app-employee-glass-card',
  standalone: false,
  templateUrl: './employee-glass-card.html',
  styleUrl: './employee-glass-card.scss',
})
export class EmployeeGlassCardComponent {
  @Input() employee!: EmployeeGlassCardItem;
  @Output() view = new EventEmitter<number>();
  @Output() edit = new EventEmitter<number>();
  @Output() action = new EventEmitter<{ type: string; id: number }>();

  get avatarInitial(): string {
    return this.employee?.name ? this.employee.name.charAt(0).toUpperCase() : 'E';
  }

  onView(): void {
    this.view.emit(this.employee.id);
  }

  onEdit(): void {
    this.edit.emit(this.employee.id);
  }

  onQuickAction(type: string): void {
    this.action.emit({ type, id: this.employee.id });
  }
}
