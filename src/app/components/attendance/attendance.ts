import { Component, OnInit } from '@angular/core';
import { EmployeeRecord } from '../../models/employee.model';
import { AttendanceDayType, AttendanceEntry, AttendanceStatus } from '../../models/hr-ops.model';
import { Employee } from '../../services/employee';
import { HrOperations } from '../../services/hr-operations';
import { OvertimeCalculator } from '../../services/overtime-calculator';

interface AttendanceRow {
  employeeId: number;
  employeeName: string;
  status: AttendanceStatus;
  checkIn: string;
  checkOut: string;
  notes: string;
  dayType: AttendanceDayType;
  standardWorkingHours: number;
  monthlyWorkingDays: number;
  workedHours: number;
  overtimeHours: number;
  overtimeAmount: number;
  hourlySalary: number;
  overtimeMultiplier: number;
  isLate: boolean;
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
  dayTypeOptions: AttendanceDayType[] = ['Regular', 'Weekend', 'Holiday'];
  userRole = localStorage.getItem('role') ?? 'Employee';
  username = (localStorage.getItem('username') ?? '').trim().toLowerCase();
  currentEmployee: EmployeeRecord | null = null;
  successMessage = '';
  errorMessage = '';

  constructor(
    private employeeService: Employee,
    private hrOps: HrOperations,
    private overtimeCalculator: OvertimeCalculator,
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

  get totalWorkedHours(): number {
    return this.visibleRows.reduce((sum, row) => sum + row.workedHours, 0);
  }

  get totalOvertimeHours(): number {
    return this.visibleRows.reduce((sum, row) => sum + row.overtimeHours, 0);
  }

  get totalOvertimeAmount(): number {
    return this.visibleRows.reduce((sum, row) => sum + row.overtimeAmount, 0);
  }

  get lateCount(): number {
    return this.visibleRows.filter((row) => row.isLate).length;
  }

  get activeTodayCount(): number {
    return this.visibleRows.filter((row) => row.status === 'Present' || row.status === 'WFH').length;
  }

  get workProgress(): number {
    const targetHours = Math.max(this.visibleRows.length * 9, 1);
    return Math.min((this.totalWorkedHours / targetHours) * 100, 100);
  }

  get overtimeProgress(): number {
    return Math.min((this.totalOvertimeHours / 20) * 100, 100);
  }

  get activityLogs(): AttendanceEntry[] {
    return this.visibleLogs.slice(0, 7);
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
      this.recalculateRow(row);
      const saved = this.hrOps.upsertAttendance({
        employeeId: row.employeeId,
        employeeName: row.employeeName,
        date: this.selectedDate,
        status: row.status,
        checkIn: row.checkIn,
        checkOut: row.checkOut,
        notes: row.notes.trim(),
        markedBy: actor,
        dayType: row.dayType,
        standardWorkingHours: row.standardWorkingHours,
        monthlyWorkingDays: row.monthlyWorkingDays,
        workedHours: row.workedHours,
        overtimeHours: row.overtimeHours,
        overtimeMultiplier: row.overtimeMultiplier,
        hourlySalary: row.hourlySalary,
        overtimeAmount: row.overtimeAmount,
      });
      this.hrOps.addAudit({
        action: 'Attendance Updated',
        module: 'Attendance',
        changedBy: actor,
        details: `${saved.employeeName} marked ${saved.status} for ${this.selectedDate}. OT ${saved.overtimeHours ?? 0} hrs, Rs ${saved.overtimeAmount ?? 0}.`,
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
      const dayType = existing?.dayType ?? this.overtimeCalculator.inferDayType(this.selectedDate);
      const row: AttendanceRow = {
        employeeId: employee.id,
        employeeName: employee.name,
        status: existing?.status ?? 'Present',
        checkIn: existing?.checkIn ?? '09:30',
        checkOut: existing?.checkOut ?? '18:30',
        notes: existing?.notes ?? '',
        dayType,
        standardWorkingHours: existing?.standardWorkingHours ?? 9,
        monthlyWorkingDays: existing?.monthlyWorkingDays ?? 26,
        workedHours: existing?.workedHours ?? 0,
        overtimeHours: existing?.overtimeHours ?? 0,
        overtimeAmount: existing?.overtimeAmount ?? 0,
        hourlySalary: existing?.hourlySalary ?? 0,
        overtimeMultiplier: existing?.overtimeMultiplier ?? 1,
        isLate: false,
      };
      this.recalculateRow(row);
      return row;
    });
  }

  recalculateRow(row: AttendanceRow): void {
    const employee = this.employees.find((item) => item.id === row.employeeId);
    const calculated = this.overtimeCalculator.calculateDaily({
      date: this.selectedDate,
      checkIn: row.checkIn,
      checkOut: row.checkOut,
      status: row.status,
      monthlySalary: employee?.salary ?? 0,
      standardWorkingHours: Number(row.standardWorkingHours) || 9,
      monthlyWorkingDays: Number(row.monthlyWorkingDays) || 26,
      dayType: row.dayType,
    });

    row.workedHours = calculated.workedHours;
    row.overtimeHours = calculated.overtimeHours;
    row.overtimeAmount = calculated.overtimeAmount;
    row.hourlySalary = calculated.hourlySalary;
    row.overtimeMultiplier = calculated.overtimeMultiplier;
    row.isLate = this.overtimeCalculator.isLate(row.checkIn);
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

    if (this.currentEmployee) {
      this.errorMessage = '';
    } else {
      this.errorMessage =
        'Your employee profile was not found. Please login using your registered employee email.';
    }
  }
}
