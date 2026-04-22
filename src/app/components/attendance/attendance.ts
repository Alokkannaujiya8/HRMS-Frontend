import { Component, OnInit } from '@angular/core';
import { EmployeeRecord } from '../../models/employee.model';
import { AttendanceEntry, AttendanceStatus } from '../../models/hr-ops.model';
import { Employee } from '../../services/employee';
import { HrOperations } from '../../services/hr-operations';

interface AttendanceRow {
  employeeId: number;
  employeeName: string;
  status: AttendanceStatus;
  checkIn: string;
  checkOut: string;
  notes: string;
}

@Component({
  selector: 'app-attendance',
  standalone: false,
  templateUrl: './attendance.html',
  styleUrl: './attendance.scss',
})
export class Attendance implements OnInit {
  selectedDate = new Date().toISOString().split('T')[0];
  employees: EmployeeRecord[] = [];
  rows: AttendanceRow[] = [];
  logs: AttendanceEntry[] = [];
  statusOptions: AttendanceStatus[] = ['Present', 'Absent', 'WFH', 'Half Day'];
  userRole = localStorage.getItem('role') ?? 'Employee';
  username = (localStorage.getItem('username') ?? '').trim().toLowerCase();
  currentEmployee: EmployeeRecord | null = null;
  successMessage = '';
  errorMessage = '';

  constructor(
    private employeeService: Employee,
    private hrOps: HrOperations,
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  get canManageAll(): boolean {
    return this.userRole === 'Admin' || this.userRole === 'HR';
  }

  get visibleRows(): AttendanceRow[] {
    if (this.canManageAll) {
      return this.rows;
    }

    if (!this.currentEmployee) {
      return [];
    }

    return this.rows.filter((row) => row.employeeId === this.currentEmployee?.id);
  }

  get visibleLogs(): AttendanceEntry[] {
    if (this.canManageAll) {
      return this.logs;
    }

    if (!this.currentEmployee) {
      return [];
    }

    return this.logs.filter((log) => log.employeeId === this.currentEmployee?.id);
  }

  loadEmployees(): void {
    this.employeeService.getEmployees().subscribe({
      next: (data) => {
        this.employees = data ?? [];
        this.resolveCurrentEmployee();
        this.bootstrapRows();
        this.loadLogs();
      },
      error: (err: Error) => {
        this.errorMessage = err.message;
      },
    });
  }

  onDateChange(): void {
    this.bootstrapRows();
    this.loadLogs();
  }

  saveAttendance(): void {
    this.successMessage = '';
    this.errorMessage = '';
    const actor = this.userRole || 'System';

    const rowsToSave = this.visibleRows;
    if (rowsToSave.length === 0) {
      this.errorMessage = 'No attendance row available for this user.';
      return;
    }

    rowsToSave.forEach((row) => {
      const saved = this.hrOps.upsertAttendance({
        employeeId: row.employeeId,
        employeeName: row.employeeName,
        date: this.selectedDate,
        status: row.status,
        checkIn: row.checkIn,
        checkOut: row.checkOut,
        notes: row.notes.trim(),
        markedBy: actor,
      });
      this.hrOps.addAudit({
        action: 'Attendance Updated',
        module: 'Attendance',
        changedBy: actor,
        details: `${saved.employeeName} marked ${saved.status} for ${this.selectedDate}.`,
      });
    });

    this.successMessage = this.canManageAll
      ? `Attendance saved for ${this.selectedDate}.`
      : `Your attendance is saved for ${this.selectedDate}.`;
    this.loadLogs();
  }

  private bootstrapRows(): void {
    const existingEntries = this.hrOps
      .getAttendanceEntries()
      .filter((item) => item.date === this.selectedDate);

    this.rows = this.employees.map((employee) => {
      const existing = existingEntries.find((entry) => entry.employeeId === employee.id);
      return {
        employeeId: employee.id,
        employeeName: employee.name,
        status: existing?.status ?? 'Present',
        checkIn: existing?.checkIn ?? '09:30',
        checkOut: existing?.checkOut ?? '18:30',
        notes: existing?.notes ?? '',
      };
    });
  }

  private loadLogs(): void {
    this.logs = this.hrOps
      .getAttendanceEntries()
      .filter((item) => item.date === this.selectedDate);
  }

  private resolveCurrentEmployee(): void {
    if (this.canManageAll) {
      return;
    }

    this.currentEmployee =
      this.employees.find(
        (employee) =>
          employee.email.toLowerCase() === this.username ||
          employee.name.toLowerCase() === this.username,
      ) ?? null;

    if (!this.currentEmployee) {
      this.errorMessage =
        'Your employee profile was not found. Please login using your registered employee email.';
    }
  }
}
