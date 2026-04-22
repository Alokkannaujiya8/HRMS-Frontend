import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { EmployeeRecord } from '../../models/employee.model';
import { SalaryStructure } from '../../models/staff.model';
import { Employee } from '../../services/employee';
import { StaffData } from '../../services/staff-data';

@Component({
  selector: 'app-salary-management',
  standalone: false,
  templateUrl: './salary-management.html',
  styleUrl: './salary-management.scss',
})
export class SalaryManagement implements OnInit {
  private readonly fb = inject(FormBuilder);

  employees: EmployeeRecord[] = [];
  selectedEmployeeId: number | null = null;
  message = '';

  salaryForm = this.fb.group({
    basicSalary: [0, [Validators.required, Validators.min(0)]],
    incrementPercent: [0, [Validators.required, Validators.min(0)]],
    incrementAmount: [0, [Validators.required, Validators.min(0)]],
    effectiveDate: ['', Validators.required],
    specialAllowance: [0, [Validators.min(0)]],
    deduction: [0, [Validators.min(0)]],
    totalSalary: [{ value: 0, disabled: true }],
  });

  constructor(
    private employeeService: Employee,
    private staffData: StaffData,
  ) {}

  ngOnInit(): void {
    this.employeeService.getEmployees().subscribe({
      next: (employees) => {
        this.employees = employees ?? [];
        this.staffData.syncEmployees(this.employees);
        if (this.employees.length > 0) {
          this.onEmployeeChange(this.employees[0].id);
        }
      },
    });

    this.salaryForm.valueChanges.subscribe(() => this.updateTotal());
  }

  get noAllowanceOrDeduction(): boolean {
    const allowance = this.salaryForm.controls.specialAllowance.value ?? 0;
    const deduction = this.salaryForm.controls.deduction.value ?? 0;
    return allowance === 0 && deduction === 0;
  }

  onEmployeeChange(employeeId: number): void {
    this.selectedEmployeeId = employeeId;
    const salary = this.staffData.getSalary(employeeId);
    this.salaryForm.patchValue({
      basicSalary: salary.basicSalary,
      incrementPercent: salary.incrementPercent,
      incrementAmount: salary.incrementAmount,
      effectiveDate: salary.effectiveDate,
      specialAllowance: salary.specialAllowance,
      deduction: salary.deduction,
      totalSalary: salary.totalSalary,
    });
    this.updateTotal();
  }

  saveSalary(): void {
    if (!this.selectedEmployeeId || this.salaryForm.invalid) {
      this.salaryForm.markAllAsTouched();
      return;
    }

    const raw = this.salaryForm.getRawValue();
    const structure: SalaryStructure = {
      employeeId: this.selectedEmployeeId,
      basicSalary: raw.basicSalary ?? 0,
      incrementPercent: raw.incrementPercent ?? 0,
      incrementAmount: raw.incrementAmount ?? 0,
      effectiveDate: raw.effectiveDate ?? '',
      specialAllowance: raw.specialAllowance ?? 0,
      deduction: raw.deduction ?? 0,
      totalSalary: raw.totalSalary ?? 0,
    };
    this.staffData.upsertSalary(structure);
    this.message = 'Salary structure saved successfully.';
    setTimeout(() => (this.message = ''), 2500);
  }

  private updateTotal(): void {
    const basic = this.salaryForm.controls.basicSalary.value ?? 0;
    const percentage = this.salaryForm.controls.incrementPercent.value ?? 0;
    const incrementAmount = this.salaryForm.controls.incrementAmount.value ?? 0;
    const allowance = this.salaryForm.controls.specialAllowance.value ?? 0;
    const deduction = this.salaryForm.controls.deduction.value ?? 0;
    const calculated = basic + (basic * percentage) / 100 + incrementAmount + allowance - deduction;
    this.salaryForm.controls.totalSalary.setValue(Math.max(calculated, 0), { emitEvent: false });
  }
}
