import { Component, OnInit } from '@angular/core';
import { EmployeeRecord } from '../../models/employee.model';
import { AttendanceEntry, LeaveRequest } from '../../models/hr-ops.model';
import { Employee } from '../../services/employee';
import { HrOperations } from '../../services/hr-operations';
import { MonthlyPayrollSummary, OvertimeCalculator } from '../../services/overtime-calculator';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-reports',
  standalone: false,
  templateUrl: './reports.html',
  styleUrl: './reports.scss',
})
export class Reports implements OnInit {
  employees: EmployeeRecord[] = [];
  attendance: AttendanceEntry[] = [];
  leaveRequests: LeaveRequest[] = [];
  payrollSummaries: MonthlyPayrollSummary[] = [];
  selectedMonth = new Date().toISOString().slice(0, 7);
  userRole = localStorage.getItem('role') ?? 'Employee';
  username = (localStorage.getItem('username') ?? '').trim().toLowerCase();
  currentEmployee: EmployeeRecord | null = null;
  message = '';
  errorMessage = '';

  constructor(
    private employeeService: Employee,
    private hrOps: HrOperations,
    private overtimeCalculator: OvertimeCalculator,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  get canExportAll(): boolean {
    return this.userRole === 'Admin' || this.userRole === 'HR';
  }

  get filteredAttendance(): AttendanceEntry[] {
    return this.visibleAttendance.filter((entry) => entry.date.startsWith(this.selectedMonth));
  }

  get filteredLeaves(): LeaveRequest[] {
    return this.visibleLeaves.filter((entry) => entry.fromDate.startsWith(this.selectedMonth));
  }

  get visiblePayrollSummaries(): MonthlyPayrollSummary[] {
    return this.payrollSummaries.filter((summary) =>
      this.visibleEmployees.some((employee) => employee.id === summary.employeeId),
    );
  }

  get monthlySalaryExpense(): number {
    return this.visiblePayrollSummaries.reduce((sum, summary) => sum + summary.monthlySalary, 0);
  }

  get monthlyOvertimeExpense(): number {
    return this.visiblePayrollSummaries.reduce((sum, summary) => sum + summary.overtimeAmount, 0);
  }

  get payrollTotalExpense(): number {
    return this.visiblePayrollSummaries.reduce((sum, summary) => sum + summary.totalSalary, 0);
  }

  get totalOvertimeHours(): number {
    return this.visiblePayrollSummaries.reduce((sum, summary) => sum + summary.totalOvertimeHours, 0);
  }

  get lateEmployees(): number {
    return this.visiblePayrollSummaries.filter((summary) => summary.lateDays > 0).length;
  }

  get visibleEmployees(): EmployeeRecord[] {
    if (this.canExportAll) {
      return this.employees;
    }
    return this.currentEmployee ? [this.currentEmployee] : [];
  }

  get visibleAttendance(): AttendanceEntry[] {
    if (this.canExportAll) {
      return this.attendance;
    }
    if (!this.currentEmployee) {
      return [];
    }
    return this.attendance.filter((entry) => entry.employeeId === this.currentEmployee?.id);
  }

  get visibleLeaves(): LeaveRequest[] {
    if (this.canExportAll) {
      return this.leaveRequests;
    }
    if (!this.currentEmployee) {
      return [];
    }
    return this.leaveRequests.filter((entry) => entry.employeeId === this.currentEmployee?.id);
  }

  // Phase 10: Export to Excel (.xlsx / .csv)
  exportExcel(): void {
    const headers = ['Employee ID', 'Name', 'Email', 'Monthly Salary (Rs)', 'Department ID', 'Join Date'];
    const rows = this.visibleEmployees.map((emp, i) => [
      `EMP000${240 + i}`,
      emp.name,
      emp.email,
      emp.salary ?? 75000,
      emp.departmentId ?? 1,
      emp.joinDate ?? '2026-01-15',
    ]);
    this.downloadCsv(`Employees_Master_Report_${this.selectedMonth}.csv`, headers, rows);
    this.toastService.showSuccess(`Excel spreadsheet generated: Employees_Master_Report_${this.selectedMonth}.csv`, 'Excel Export Complete');
  }

  // Phase 10: Export to CSV
  exportCSV(): void {
    const headers = [
      'Date',
      'Employee Name',
      'Status',
      'Day Type',
      'Check In',
      'Check Out',
      'Worked Hours',
      'Overtime Hours',
      'Hourly Salary',
      'Overtime Amount',
    ];
    const rows = this.filteredAttendance.map((entry) => [
      entry.date,
      entry.employeeName,
      entry.status,
      entry.dayType ?? 'Regular',
      entry.checkIn,
      entry.checkOut,
      entry.workedHours ?? 9,
      entry.overtimeHours ?? 0,
      entry.hourlySalary ?? 427,
      entry.overtimeAmount ?? 0,
    ]);
    this.downloadCsv(`Attendance_Log_${this.selectedMonth}.csv`, headers, rows);
    this.toastService.showSuccess(`CSV dataset exported: Attendance_Log_${this.selectedMonth}.csv`, 'CSV Export Complete');
  }

  // Phase 10: Export to PDF
  exportPDF(): void {
    const popup = window.open('', '_blank', 'width=900,height=700');
    if (!popup) {
      this.toastService.showError('Please allow browser popups to generate PDF statement.', 'Popup Blocked');
      return;
    }

    popup.document.write(`
      <html>
        <head>
          <title>NeoHR Executive BI Summary Report - ${this.selectedMonth}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, sans-serif; padding: 24px; color: #0f172a; }
            h1 { margin-bottom: 4px; color: #0ea5e9; }
            .subtitle { color: #64748b; margin-bottom: 20px; font-size: 0.9rem; }
            .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }
            .card { background: #f8fafc; border: 1px solid #cbd5e1; padding: 12px; border-radius: 8px; }
            table { width: 100%; border-collapse: collapse; margin-top: 14px; }
            th { background: #0ea5e9; color: #fff; text-align: left; padding: 8px; font-size: 0.85rem; }
            td { border: 1px solid #cbd5e1; padding: 8px; font-size: 0.85rem; }
          </style>
        </head>
        <body>
          <h1>NeoHR Executive BI Summary Report</h1>
          <p class="subtitle">Reporting Period: ${this.selectedMonth} | Generated on: ${new Date().toLocaleDateString()}</p>
          <div class="grid">
            <div class="card"><strong>Total Employees:</strong> ${this.visibleEmployees.length}</div>
            <div class="card"><strong>Monthly Base Salary:</strong> Rs ${this.monthlySalaryExpense.toLocaleString()}</div>
            <div class="card"><strong>Total OT Hours:</strong> ${this.totalOvertimeHours} Hrs</div>
            <div class="card"><strong>Overtime Expense:</strong> Rs ${this.monthlyOvertimeExpense.toLocaleString()}</div>
            <div class="card"><strong>Total Payroll Expense:</strong> Rs ${this.payrollTotalExpense.toLocaleString()}</div>
            <div class="card"><strong>Late Employees:</strong> ${this.lateEmployees}</div>
          </div>
          <table>
            <thead><tr><th>Employee Name</th><th>Monthly Salary</th><th>Worked Hrs</th><th>OT Hrs</th><th>OT Pay</th><th>Total Disbursed</th></tr></thead>
            <tbody>
              ${this.visiblePayrollSummaries
                .map(
                  (s) =>
                    `<tr><td>${s.employeeName}</td><td>Rs ${s.monthlySalary.toLocaleString()}</td><td>${s.totalWorkedHours}</td><td>${s.totalOvertimeHours}</td><td>Rs ${s.overtimeAmount.toLocaleString()}</td><td><strong>Rs ${s.totalSalary.toLocaleString()}</strong></td></tr>`,
                )
                .join('')}
            </tbody>
          </table>
        </body>
      </html>
    `);
    popup.document.close();
    popup.focus();
    popup.print();
    this.toastService.showSuccess(`PDF report statement compiled for ${this.selectedMonth}.`, 'PDF Exported');
  }

  private loadData(): void {
    this.attendance = this.hrOps.getAttendanceEntries();
    this.leaveRequests = this.hrOps.getLeaveRequests();
    this.employeeService.getEmployees().subscribe({
      next: (employees) => {
        this.employees = employees ?? [];
        this.resolveCurrentEmployee();
        this.rebuildPayrollSummaries();
      },
      error: (err: Error) => {
        this.errorMessage = err.message;
      },
    });
  }

  onMonthChange(): void {
    this.rebuildPayrollSummaries();
  }

  private downloadCsv(fileName: string, headers: string[], rows: Array<Array<string | number>>): void {
    const csvRows = [headers, ...rows].map((row) =>
      row.map((item) => `"${String(item).replaceAll('"', '""')}"`).join(','),
    );
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  private rebuildPayrollSummaries(): void {
    this.payrollSummaries = this.overtimeCalculator.createMonthlySummaries(
      this.employees,
      this.attendance,
      this.selectedMonth,
    );
  }

  private resolveCurrentEmployee(): void {
    const loginUser = (
      localStorage.getItem('email') ||
      localStorage.getItem('username') ||
      ''
    ).trim().toLowerCase();

    this.currentEmployee =
      this.employees.find((employee) => {
        const empEmail = employee.email.toLowerCase();
        const empName = employee.name.toLowerCase();
        return (
          empEmail === loginUser ||
          empName === loginUser ||
          (loginUser.length > 0 && (empEmail.includes(loginUser) || empName.includes(loginUser)))
        );
      }) ?? (this.employees.length > 0 ? this.employees[0] : null);

    if (this.currentEmployee || this.canExportAll) {
      this.errorMessage = '';
    } else {
      this.errorMessage =
        'Your employee profile was not found. Please login using your registered employee email.';
    }
  }
}
