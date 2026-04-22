import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { DepartmentItem } from '../../models/department.model';
import { DepartmentService } from '../../services/department';

@Component({
  selector: 'app-department-management',
  standalone: false,
  templateUrl: './department-management.html',
  styleUrl: './department-management.scss',
})
export class DepartmentManagement implements OnInit {
  private readonly fb = inject(FormBuilder);

  departments: DepartmentItem[] = [];
  successMessage = '';
  errorMessage = '';

  departmentForm = this.fb.group({
    name: ['', Validators.required],
    code: ['', Validators.required],
  });

  constructor(
    private departmentService: DepartmentService,
  ) {}

  ngOnInit(): void {
    this.loadDepartments();
  }

  get nameControl() {
    return this.departmentForm.controls.name;
  }

  get codeControl() {
    return this.departmentForm.controls.code;
  }

  addDepartment(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.departmentForm.invalid) {
      this.departmentForm.markAllAsTouched();
      return;
    }

    const name = this.nameControl.value?.trim() ?? '';
    const code = this.codeControl.value?.trim() ?? '';
    const result = this.departmentService.addDepartment(name, code);
    if (!result.success) {
      this.errorMessage = result.message;
      return;
    }

    this.successMessage = result.message;
    this.departmentForm.reset();
    this.loadDepartments();
  }

  deleteDepartment(id: number): void {
    this.departmentService.deleteDepartment(id);
    this.loadDepartments();
  }

  private loadDepartments(): void {
    this.departments = this.departmentService.getDepartments();
  }
}
