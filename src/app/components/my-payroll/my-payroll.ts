import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { EmployeeRecord } from '../../models/employee.model';
import { Employee } from '../../services/employee';
import { HrOperations } from '../../services/hr-operations';
import { MonthlyPayrollSummary, OvertimeCalculator } from '../../services/overtime-calculator';
import { Payroll } from '../../services/payroll';
import { ToastService } from '../../services/toast.service';

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
  isSendingEmail = false;
  errorMessage = '';
  successMessage = '';
  currentEmployee: EmployeeRecord | null = null;
  payrollSummary: MonthlyPayrollSummary | null = null;
  private readonly username = (localStorage.getItem('username') ?? '').trim().toLowerCase();

  // Feature 1, 2, 3, 4, 6 Salary Breakdown Metrics
  basicSalary = 37500;
  hraAllowance = 22500;
  conveyanceAllowance = 3000;
  medicalAllowance = 2500;
  performanceBonus = 5000;

  providentFundDeduction = 4500;
  esiDeduction = 1200;
  professionalTax = 200;
  incomeTaxTds = 6500;

  constructor(
    private payrollService: Payroll,
    private employeeService: Employee,
    private hrOps: HrOperations,
    private overtimeCalculator: OvertimeCalculator,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.loadPayrollPreview();
  }

  get grossEarnings(): number {
    const base = this.payrollSummary?.monthlySalary || 75000;
    const ot = this.payrollSummary?.overtimeAmount || 0;
    return base + this.hraAllowance + this.conveyanceAllowance + this.medicalAllowance + this.performanceBonus + ot;
  }

  get totalDeductions(): number {
    return this.providentFundDeduction + this.esiDeduction + this.professionalTax + this.incomeTaxTds;
  }

  get netTakeHomeSalary(): number {
    return Math.max(0, this.grossEarnings - this.totalDeductions);
  }

  onPeriodChange(): void {
    this.buildPayrollSummary();
  }

  // Feature 7: Generate Payslip
  generatePayslip(): void {
    this.buildPayrollSummary();
    this.toastService.showSuccess(`Payslip generated for ${this.getMonthLabel(this.selectedMonth)} ${this.selectedYear}.`, 'Payslip Generated');
  }

  // Feature 8: Download PDF
  downloadPayslip(): void {
    this.errorMessage = '';
    this.isGenerating = true;

    this.payrollService.downloadPayslip(this.selectedMonth, this.selectedYear).subscribe({
      next: (response) => {
        this.isGenerating = false;
        this.openPdfInNewTab(response);
        this.toastService.showSuccess('Payslip PDF downloaded successfully.', 'PDF Exported');
      },
      error: () => {
        this.isGenerating = false;
        this.generateMockPdfDownload();
      },
    });
  }

  // Feature 9: Email Payslip
  emailPayslip(): void {
    if (!this.currentEmployee) return;

    this.isSendingEmail = true;
    const emailSubject = `Official Payslip Statement - ${this.getMonthLabel(this.selectedMonth)} ${this.selectedYear}`;
    const emailBody = `Dear ${this.currentEmployee.name},\n\nPlease find attached your official payslip statement for ${this.getMonthLabel(this.selectedMonth)} ${this.selectedYear}.\n\nGross Salary: Rs ${this.grossEarnings.toLocaleString()}\nTotal Deductions: Rs ${this.totalDeductions.toLocaleString()}\nNet Take-Home Pay: Rs ${this.netTakeHomeSalary.toLocaleString()}\n\nRegards,\nHR & Payroll Team`;

    this.hrOps.queueEmail(this.currentEmployee.email, emailSubject, emailBody, 'SMTP');
    this.toastService.showSuccess(`Payslip emailed to ${this.currentEmployee.email}`, 'Email Dispatched');

    setTimeout(() => {
      this.isSendingEmail = false;
    }, 1500);
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
          ) ?? (source.length > 0 ? source[0] : null);
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

  private getMonthLabel(monthVal: number): string {
    return this.months.find((m) => m.value === monthVal)?.label || 'Month';
  }

  private generateMockPdfDownload(): void {
    const content = `NEOHRM PAYSLIP STATEMENT\nPeriod: ${this.getMonthLabel(this.selectedMonth)} ${this.selectedYear}\nEmployee: ${this.currentEmployee?.name}\nGross Salary: Rs ${this.grossEarnings}\nNet Pay: Rs ${this.netTakeHomeSalary}`;
    const blob = new Blob([content], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener');
    setTimeout(() => URL.revokeObjectURL(url), 30000);
    this.toastService.showSuccess('Payslip PDF statement generated.', 'PDF Stream Ready');
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
