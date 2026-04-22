import { Component } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
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
export class MyPayroll {
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

  constructor(private payrollService: Payroll) {}

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
