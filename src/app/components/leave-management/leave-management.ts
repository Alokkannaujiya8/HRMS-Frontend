import { Component, OnInit } from '@angular/core';
import { EmployeeRecord } from '../../models/employee.model';
import { LeaveRequest } from '../../models/hr-ops.model';
import { Employee } from '../../services/employee';
import { HrOperations } from '../../services/hr-operations';

@Component({
  selector: 'app-leave-management',
  standalone: false,
  templateUrl: './leave-management.html',
  styleUrl: './leave-management.scss',
})
export class LeaveManagement implements OnInit {
  employees: EmployeeRecord[] = [];
  leaveRequests: LeaveRequest[] = [];
  selectedEmployeeId: number | null = null;
  leaveType: 'Casual' | 'Sick' | 'Earned' = 'Casual';
  fromDate = '';
  toDate = '';
  reason = '';
  successMessage = '';
  errorMessage = '';
  userRole = localStorage.getItem('role') ?? 'Employee';
  username = (localStorage.getItem('username') ?? '').trim().toLowerCase();
  currentEmployee: EmployeeRecord | null = null;

  constructor(
    private employeeService: Employee,
    private hrOps: HrOperations,
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  get canReview(): boolean {
    return this.userRole === 'Admin' || this.userRole === 'HR';
  }

  get visibleLeaveRequests(): LeaveRequest[] {
    if (this.canReview) {
      return this.leaveRequests;
    }

    if (!this.currentEmployee) {
      return [];
    }

    return this.leaveRequests.filter((leave) => leave.employeeId === this.currentEmployee?.id);
  }

  get selfLeaveBalance(): number {
    if (!this.currentEmployee) {
      return 0;
    }

    return this.leaveBalanceByEmployee[this.currentEmployee.id] ?? 0;
  }

  get leaveBalanceByEmployee(): Record<number, number> {
    const totalEntitlement = 24;
    const result: Record<number, number> = {};

    this.employees.forEach((employee) => {
      const used = this.leaveRequests
        .filter((leave) => leave.employeeId === employee.id && leave.status === 'Approved')
        .reduce((sum, leave) => sum + this.calculateLeaveDays(leave.fromDate, leave.toDate), 0);
      result[employee.id] = Math.max(totalEntitlement - used, 0);
    });

    return result;
  }

  applyLeave(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (!this.fromDate || !this.toDate || !this.reason.trim()) {
      this.errorMessage = 'Please fill all leave request fields.';
      return;
    }

    if (new Date(this.toDate) < new Date(this.fromDate)) {
      this.errorMessage = 'To date cannot be earlier than from date.';
      return;
    }

    const targetEmployeeId = this.canReview ? this.selectedEmployeeId : this.currentEmployee?.id;
    if (!targetEmployeeId) {
      this.errorMessage = 'Employee profile not found for leave request.';
      return;
    }

    const employee = this.employees.find((item) => item.id === targetEmployeeId);
    if (!employee) {
      this.errorMessage = 'Selected employee not found.';
      return;
    }

    const created = this.hrOps.addLeaveRequest({
      employeeId: employee.id,
      employeeName: employee.name,
      leaveType: this.leaveType,
      fromDate: this.fromDate,
      toDate: this.toDate,
      reason: this.reason.trim(),
    });

    this.hrOps.addAudit({
      action: 'Leave Applied',
      module: 'Leave',
      changedBy: this.userRole,
      details: `${created.employeeName} applied ${created.leaveType} leave (${created.fromDate} to ${created.toDate}).`,
    });

    this.leaveRequests = this.hrOps.getLeaveRequests();
    this.successMessage = 'Leave request submitted successfully.';
    this.fromDate = '';
    this.toDate = '';
    this.reason = '';
  }

  approveLeave(id: number): void {
    if (!this.canReview) {
      return;
    }

    const request = this.leaveRequests.find((item) => item.id === id);
    if (!request || request.employeeId === this.currentEmployee?.id) {
      return;
    }

    const updated = this.hrOps.updateLeaveStatus(id, 'Approved', this.userRole);
    if (!updated) {
      return;
    }

    this.hrOps.addSystemNotification(
      updated.employeeName,
      'Leave Approved',
      `Your leave from ${updated.fromDate} to ${updated.toDate} has been approved.`,
    );
    this.hrOps.queueEmail(
      updated.employeeName,
      'Leave Approval Notification',
      `Hello ${updated.employeeName}, your leave request has been approved.`,
      'SMTP',
    );
    this.hrOps.addAudit({
      action: 'Leave Approved',
      module: 'Leave',
      changedBy: this.userRole,
      details: `${updated.employeeName}'s leave approved by ${this.userRole}.`,
    });
    this.leaveRequests = this.hrOps.getLeaveRequests();
  }

  rejectLeave(id: number): void {
    if (!this.canReview) {
      return;
    }

    const request = this.leaveRequests.find((item) => item.id === id);
    if (!request || request.employeeId === this.currentEmployee?.id) {
      return;
    }

    const updated = this.hrOps.updateLeaveStatus(id, 'Rejected', this.userRole, 'Insufficient staffing');
    if (!updated) {
      return;
    }

    this.hrOps.addSystemNotification(
      updated.employeeName,
      'Leave Rejected',
      `Your leave request from ${updated.fromDate} to ${updated.toDate} was rejected.`,
    );
    this.hrOps.addAudit({
      action: 'Leave Rejected',
      module: 'Leave',
      changedBy: this.userRole,
      details: `${updated.employeeName}'s leave rejected by ${this.userRole}.`,
    });
    this.leaveRequests = this.hrOps.getLeaveRequests();
  }

  private loadData(): void {
    this.leaveRequests = this.hrOps.getLeaveRequests();
    this.employeeService.getEmployees().subscribe({
      next: (employees) => {
        this.employees = employees ?? [];
        this.resolveCurrentEmployee();
        if (this.employees.length > 0 && !this.selectedEmployeeId) {
          this.selectedEmployeeId = this.canReview
            ? this.employees[0].id
            : this.currentEmployee?.id ?? null;
        }
      },
      error: (err: Error) => {
        this.errorMessage = err.message;
      },
    });
  }

  private calculateLeaveDays(fromDate: string, toDate: string): number {
    const start = new Date(fromDate);
    const end = new Date(toDate);
    const diff = end.getTime() - start.getTime();
    if (diff < 0) {
      return 0;
    }
    return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
  }

  private resolveCurrentEmployee(): void {
    this.currentEmployee =
      this.employees.find(
        (employee) =>
          employee.email.toLowerCase() === this.username ||
          employee.name.toLowerCase() === this.username,
      ) ?? null;

    if (!this.canReview && !this.currentEmployee) {
      this.errorMessage =
        'Your employee profile was not found. Please login using your registered employee email.';
    }
  }
}
