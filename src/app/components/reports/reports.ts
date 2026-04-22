import { Component, OnInit } from '@angular/core';
import { EmployeeRecord } from '../../models/employee.model';
import { AttendanceEntry, LeaveRequest } from '../../models/hr-ops.model';
import { Employee } from '../../services/employee';
import { HrOperations } from '../../services/hr-operations';

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
  selectedMonth = new Date().toISOString().slice(0, 7);
  userRole = localStorage.getItem('role') ?? 'Employee';
  username = (localStorage.getItem('username') ?? '').trim().toLowerCase();
  currentEmployee: EmployeeRecord | null = null;
  message = '';
  errorMessage = '';

  constructor(
    private employeeService: Employee,
    private hrOps: HrOperations,
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

  get monthlySalaryExpense(): number {
    const source = this.canExportAll
      ? this.employees
      : this.currentEmployee
        ? [this.currentEmployee]
        : [];
    return source.reduce((sum, employee) => sum + (employee.salary ?? 0), 0);
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

  downloadExcelReport(): void {
    if (!this.canExportAll) {
      this.errorMessage = 'Only Admin/HR can export full Excel reports.';
      return;
    }

    const headers = ['Employee', 'Email', 'Salary', 'DepartmentId', 'JoinDate'];
    const rows = this.visibleEmployees.map((employee) => [
      employee.name,
      employee.email,
      employee.salary ?? 0,
      employee.departmentId ?? '',
      employee.joinDate ?? '',
    ]);
    this.downloadCsv('employee-report.csv', headers, rows);
    this.logReportingAction('Excel/CSV report exported');
  }

  downloadAttendanceExcel(): void {
    if (!this.canExportAll) {
      this.errorMessage = 'Only Admin/HR can export attendance sheets.';
      return;
    }

    const headers = ['Date', 'Employee', 'Status', 'CheckIn', 'CheckOut', 'MarkedBy'];
    const rows = this.filteredAttendance.map((entry) => [
      entry.date,
      entry.employeeName,
      entry.status,
      entry.checkIn,
      entry.checkOut,
      entry.markedBy,
    ]);
    this.downloadCsv(`attendance-${this.selectedMonth}.csv`, headers, rows);
    this.logReportingAction(`Attendance CSV exported for ${this.selectedMonth}`);
  }

  downloadPdfSummary(): void {
    if (!this.canExportAll) {
      this.errorMessage = 'Only Admin/HR can generate organization PDF summary.';
      return;
    }

    const popup = window.open('', '_blank', 'width=900,height=700');
    if (!popup) {
      this.errorMessage = 'Please allow popup to generate PDF report.';
      return;
    }

    popup.document.write(`
      <html>
        <head>
          <title>HR Monthly Summary</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #0f172a; }
            h1 { margin-bottom: 6px; }
            table { width: 100%; border-collapse: collapse; margin-top: 14px; }
            th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
          </style>
        </head>
        <body>
          <h1>HR Summary (${this.selectedMonth})</h1>
          <p>Total Employees: ${this.visibleEmployees.length}</p>
          <p>Monthly Salary Expense: Rs ${this.monthlySalaryExpense}</p>
          <p>Attendance Records: ${this.filteredAttendance.length}</p>
          <p>Leave Requests: ${this.filteredLeaves.length}</p>
          <table>
            <thead><tr><th>Employee</th><th>Email</th><th>Salary</th></tr></thead>
            <tbody>
              ${this.visibleEmployees
                .map(
                  (employee) =>
                    `<tr><td>${employee.name}</td><td>${employee.email}</td><td>Rs ${employee.salary ?? 0}</td></tr>`,
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
    this.logReportingAction(`PDF summary generated for ${this.selectedMonth}`);
  }

  private loadData(): void {
    this.attendance = this.hrOps.getAttendanceEntries();
    this.leaveRequests = this.hrOps.getLeaveRequests();
    this.employeeService.getEmployees().subscribe({
      next: (employees) => {
        this.employees = employees ?? [];
        this.resolveCurrentEmployee();
      },
      error: (err: Error) => {
        this.errorMessage = err.message;
      },
    });
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

  private logReportingAction(details: string): void {
    this.hrOps.addAudit({
      action: 'Report Exported',
      module: 'Reporting',
      changedBy: this.userRole,
      details,
    });
    this.message = details;
    this.errorMessage = '';
  }

  private resolveCurrentEmployee(): void {
    this.currentEmployee =
      this.employees.find(
        (employee) =>
          employee.email.toLowerCase() === this.username ||
          employee.name.toLowerCase() === this.username,
      ) ?? null;

    if (!this.canExportAll && !this.currentEmployee) {
      this.errorMessage =
        'Your employee profile was not found. Please login using your registered employee email.';
    }
  }
}
