import { Injectable } from '@angular/core';
import { EmployeeRecord } from '../models/employee.model';
import { AttendanceDayType, AttendanceEntry } from '../models/hr-ops.model';

export interface OvertimeInput {
  date: string;
  checkIn: string;
  checkOut: string;
  status: string;
  monthlySalary: number;
  standardWorkingHours: number;
  monthlyWorkingDays: number;
  dayType: AttendanceDayType;
}

export interface DailyOvertimeResult {
  workedHours: number;
  overtimeHours: number;
  overtimeMultiplier: number;
  hourlySalary: number;
  overtimeAmount: number;
}

export interface MonthlyPayrollSummary {
  employeeId: number;
  employeeName: string;
  monthlySalary: number;
  standardMonthlyHours: number;
  hourlySalary: number;
  presentDays: number;
  leaveDays: number;
  lateDays: number;
  weekendOtHours: number;
  holidayOtHours: number;
  totalWorkedHours: number;
  totalOvertimeHours: number;
  overtimeAmount: number;
  totalSalary: number;
}

@Injectable({
  providedIn: 'root',
})
export class OvertimeCalculator {
  calculateDaily(input: OvertimeInput): DailyOvertimeResult {
    const monthlySalary = Math.max(input.monthlySalary, 0);
    const standardWorkingHours = Math.max(input.standardWorkingHours, 1);
    const monthlyWorkingDays = Math.max(input.monthlyWorkingDays, 1);
    const standardMonthlyHours = standardWorkingHours * monthlyWorkingDays;
    const hourlySalary = standardMonthlyHours > 0 ? monthlySalary / standardMonthlyHours : 0;
    const workedHours = this.getWorkedHours(input.checkIn, input.checkOut, input.status);
    const overtimeMultiplier = this.getOvertimeMultiplier(input.dayType);
    const overtimeHours =
      input.dayType === 'Regular' ? Math.max(workedHours - standardWorkingHours, 0) : workedHours;

    return {
      workedHours: this.round(workedHours),
      overtimeHours: this.round(overtimeHours),
      overtimeMultiplier,
      hourlySalary: this.round(hourlySalary),
      overtimeAmount: this.round(hourlySalary * overtimeHours * overtimeMultiplier),
    };
  }

  createMonthlySummaries(
    employees: EmployeeRecord[],
    entries: AttendanceEntry[],
    selectedMonth: string,
  ): MonthlyPayrollSummary[] {
    return employees.map((employee) => {
      const employeeEntries = entries.filter(
        (entry) => entry.employeeId === employee.id && entry.date.startsWith(selectedMonth),
      );
      const salary = employee.salary ?? 0;
      const firstEntry = employeeEntries[0];
      const standardWorkingHours = firstEntry?.standardWorkingHours ?? 9;
      const monthlyWorkingDays = firstEntry?.monthlyWorkingDays ?? 26;
      const standardMonthlyHours = standardWorkingHours * monthlyWorkingDays;
      const hourlySalary = standardMonthlyHours > 0 ? salary / standardMonthlyHours : 0;
      const presentDays = employeeEntries.filter(
        (entry) => entry.status === 'Present' || entry.status === 'WFH',
      ).length;
      const leaveDays = employeeEntries.filter(
        (entry) => entry.status === 'Absent' || entry.status === 'Half Day',
      ).length;
      const lateDays = employeeEntries.filter((entry) => this.isLate(entry.checkIn)).length;
      const weekendOtHours = employeeEntries
        .filter((entry) => entry.dayType === 'Weekend')
        .reduce((sum, entry) => sum + this.getEntryOvertime(entry, employee), 0);
      const holidayOtHours = employeeEntries
        .filter((entry) => entry.dayType === 'Holiday')
        .reduce((sum, entry) => sum + this.getEntryOvertime(entry, employee), 0);
      const totalWorkedHours = employeeEntries.reduce(
        (sum, entry) => sum + this.getEntryWorkedHours(entry, employee),
        0,
      );
      const totalOvertimeHours = employeeEntries.reduce(
        (sum, entry) => sum + this.getEntryOvertime(entry, employee),
        0,
      );
      const overtimeAmount = employeeEntries.reduce(
        (sum, entry) => sum + this.getEntryOvertimeAmount(entry, employee),
        0,
      );

      return {
        employeeId: employee.id,
        employeeName: employee.name,
        monthlySalary: salary,
        standardMonthlyHours: this.round(standardMonthlyHours),
        hourlySalary: this.round(hourlySalary),
        presentDays,
        leaveDays,
        lateDays,
        weekendOtHours: this.round(weekendOtHours),
        holidayOtHours: this.round(holidayOtHours),
        totalWorkedHours: this.round(totalWorkedHours),
        totalOvertimeHours: this.round(totalOvertimeHours),
        overtimeAmount: this.round(overtimeAmount),
        totalSalary: this.round(salary + overtimeAmount),
      };
    });
  }

  inferDayType(date: string): AttendanceDayType {
    const parsedDate = new Date(`${date}T00:00:00`);
    const day = parsedDate.getDay();
    return day === 0 || day === 6 ? 'Weekend' : 'Regular';
  }

  isLate(checkIn: string): boolean {
    return this.timeToMinutes(checkIn) > this.timeToMinutes('09:30');
  }

  private getEntryWorkedHours(entry: AttendanceEntry, employee: EmployeeRecord): number {
    if (typeof entry.workedHours === 'number') {
      return entry.workedHours;
    }

    return this.calculateDaily({
      date: entry.date,
      checkIn: entry.checkIn,
      checkOut: entry.checkOut,
      status: entry.status,
      monthlySalary: employee.salary ?? 0,
      standardWorkingHours: entry.standardWorkingHours ?? 9,
      monthlyWorkingDays: entry.monthlyWorkingDays ?? 26,
      dayType: entry.dayType ?? this.inferDayType(entry.date),
    }).workedHours;
  }

  private getEntryOvertime(entry: AttendanceEntry, employee: EmployeeRecord): number {
    if (typeof entry.overtimeHours === 'number') {
      return entry.overtimeHours;
    }

    return this.calculateDaily({
      date: entry.date,
      checkIn: entry.checkIn,
      checkOut: entry.checkOut,
      status: entry.status,
      monthlySalary: employee.salary ?? 0,
      standardWorkingHours: entry.standardWorkingHours ?? 9,
      monthlyWorkingDays: entry.monthlyWorkingDays ?? 26,
      dayType: entry.dayType ?? this.inferDayType(entry.date),
    }).overtimeHours;
  }

  private getEntryOvertimeAmount(entry: AttendanceEntry, employee: EmployeeRecord): number {
    if (typeof entry.overtimeAmount === 'number') {
      return entry.overtimeAmount;
    }

    return this.calculateDaily({
      date: entry.date,
      checkIn: entry.checkIn,
      checkOut: entry.checkOut,
      status: entry.status,
      monthlySalary: employee.salary ?? 0,
      standardWorkingHours: entry.standardWorkingHours ?? 9,
      monthlyWorkingDays: entry.monthlyWorkingDays ?? 26,
      dayType: entry.dayType ?? this.inferDayType(entry.date),
    }).overtimeAmount;
  }

  private getWorkedHours(checkIn: string, checkOut: string, status: string): number {
    if (status === 'Absent' || !checkIn || !checkOut) {
      return 0;
    }

    const start = this.timeToMinutes(checkIn);
    const end = this.timeToMinutes(checkOut);
    if (end <= start) {
      return 0;
    }

    return (end - start) / 60;
  }

  private getOvertimeMultiplier(dayType: AttendanceDayType): number {
    if (dayType === 'Holiday') {
      return 2;
    }

    return 1;
  }

  private timeToMinutes(value: string): number {
    const [hours = '0', minutes = '0'] = value.split(':');
    return Number(hours) * 60 + Number(minutes);
  }

  private round(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }
}
