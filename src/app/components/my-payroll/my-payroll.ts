import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { EmployeeRecord } from '../../models/employee.model';
import { Employee } from '../../services/employee';
import { HrOperations } from '../../services/hr-operations';
import { MonthlyPayrollSummary, OvertimeCalculator } from '../../services/overtime-calculator';
import { Payroll } from '../../services/payroll';

interface MonthOption {
  value: number;
  label: string;
}

@Component({
  selector: 'app-my-payroll',
  standalone: false,
  templateUrl: './my-payroll.html',
  styleUrl: './my-payroll.scss',
})
export class MyPayroll implements OnInit {
  readonly months: MonthOption[] = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  readonly years: number[] = this.generateYearOptions();

  selectedMonth = new Date().getMonth() + 1;
  selectedYear = new Date().getFullYear();
  isGenerating = false;
  errorMessage = '';
  currentEmployee: EmployeeRecord | null = null;
  payrollSummary: MonthlyPayrollSummary | null = null;
  private readonly username = (localStorage.getItem('username') ?? '').trim().toLowerCase();

  constructor(
    private payrollService: Payroll,
    private employeeService: Employee,
    private hrOps: HrOperations,
    private overtimeCalculator: OvertimeCalculator,
  ) {}

  ngOnInit(): void {
    this.loadPayrollPreview();
  }

  onPeriodChange(): void {
    this.buildPayrollSummary();
  }

  downloadPayslip(): void {
    this.errorMessage = '';
    this.isGenerating = true;

    this.payrollService.downloadPayslip(this.selectedMonth, this.selectedYear).subscribe({
      next: (response) => {
        this.isGenerating = false;
        this.openPdfInNewTab(response);
      },
      error: (error: HttpErrorResponse) => {
        this.isGenerating = false;
        this.errorMessage = error.error?.message || 'Unable to generate payslip right now.';
      },
    });
  }

  private loadPayrollPreview(): void {
    this.employeeService.getEmployees().subscribe({
      next: (employees) => {
        const source = employees ?? [];
        this.currentEmployee =
          source.find(
            (employee) =>
              employee.email.toLowerCase() === this.username ||
              employee.name.toLowerCase() === this.username,
          ) ?? null;
        this.buildPayrollSummary();
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
      },
    });
  }

  private buildPayrollSummary(): void {
    if (!this.currentEmployee) {
      this.payrollSummary = null;
      return;
    }

    const monthKey = `${this.selectedYear}-${String(this.selectedMonth).padStart(2, '0')}`;
    this.payrollSummary =
      this.overtimeCalculator.createMonthlySummaries(
        [this.currentEmployee],
        this.hrOps.getAttendanceEntries(),
        monthKey,
      )[0] ?? null;
  }

  private openPdfInNewTab(response: HttpResponse<Blob>): void {
    const blob = response.body;
    if (!blob) {
      this.errorMessage = 'Empty PDF response received from server.';
      return;
    }

    const file = new Blob([blob], { type: 'application/pdf' });
    const fileUrl = URL.createObjectURL(file);
    window.open(fileUrl, '_blank', 'noopener');
    setTimeout(() => URL.revokeObjectURL(fileUrl), 30000);
  }

  private generateYearOptions(): number[] {
    const currentYear = new Date().getFullYear();
    const years: number[] = [];
    for (let year = currentYear; year >= currentYear - 5; year--) {
      years.push(year);
    }
    return years;
  }
}
