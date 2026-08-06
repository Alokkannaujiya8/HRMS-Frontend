import { Component, OnInit } from '@angular/core';
import { EmployeeRecord } from '../../models/employee.model';
import { LeaveRequest } from '../../models/hr-ops.model';
import { Employee } from '../../services/employee';
import { HrOperations } from '../../services/hr-operations';
import { ToastService } from '../../services/toast.service';

export interface CalendarLeaveDay {
  date: string;
  dayNumber: number;
  onLeaveNames: string[];
}

@Component({
  selector: 'app-leave-management',
  standalone: false,
  templateUrl: './leave-management.html',
  styleUrl: './leave-management.scss',
})
export class LeaveManagement implements OnInit {
  employees: EmployeeRecord[] = [];
  leaveRequests: LeaveRequest[] = [];
  calendarDays: CalendarLeaveDay[] = [];

  selectedEmployeeId: number | null = null;
  leaveType: 'Casual' | 'Sick' | 'Earned' = 'Casual';
  fromDate = '';
  toDate = '';
  reason = '';
  rejectionReason = '';
  rejectingLeaveId: number | null = null;

  successMessage = '';
  errorMessage = '';
  userRole = localStorage.getItem('role') ?? 'Employee';
  username = (localStorage.getItem('username') ?? '').trim().toLowerCase();
  currentEmployee: EmployeeRecord | null = null;

  // Leave Balances
  casualLeaveBalance = 8;
  sickLeaveBalance = 6;
  earnedLeaveBalance = 15;

  constructor(
    private employeeService: Employee,
    private hrOps: HrOperations,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.generateLeaveCalendar();
  }

  get canReview(): boolean {
    return this.userRole === 'Admin' || this.userRole === 'HR' || this.userRole === 'Manager';
  }

  get isManager(): boolean {
    return this.userRole === 'Manager';
  }

  get isHrOrAdmin(): boolean {
    return this.userRole === 'HR' || this.userRole === 'Admin';
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
    return this.casualLeaveBalance + this.sickLeaveBalance + this.earnedLeaveBalance;
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

  // Feature 1: Apply Leave
  applyLeave(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (!this.fromDate || !this.toDate || !this.reason.trim()) {
      this.toastService.showError('Please complete all mandatory leave fields.', 'Validation Error');
      return;
    }

    if (new Date(this.toDate) < new Date(this.fromDate)) {
      this.toastService.showError('To date cannot be earlier than from date.', 'Date Error');
      return;
    }

    const targetEmployeeId = this.canReview ? this.selectedEmployeeId : this.currentEmployee?.id;
    if (!targetEmployeeId) {
      this.toastService.showError('Employee profile not found.', 'Profile Missing');
      return;
    }

    const employee = this.employees.find((item) => item.id === targetEmployeeId);
    if (!employee) {
      this.toastService.showError('Selected employee not found.', 'Error');
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
    this.toastService.showSuccess(`Leave request submitted for ${created.employeeName}. Awaiting Approval.`, 'Leave Applied');
    this.fromDate = '';
    this.toDate = '';
    this.reason = '';
    this.generateLeaveCalendar();
  }

  // Feature 2: Manager Approval
  approveManager(id: number): void {
    const request = this.leaveRequests.find((item) => item.id === id);
    if (!request) return;

    this.toastService.showSuccess(`Manager Tier-1 Approval granted for ${request.employeeName}. Forwarded to HR.`, 'Manager Approved');
    this.hrOps.addAudit({
      action: 'Manager Approved',
      module: 'Leave',
      changedBy: 'Manager',
      details: `${request.employeeName}'s leave approved by Manager.`,
    });
  }

  // Feature 3: HR Approval
  approveHR(id: number): void {
    const request = this.leaveRequests.find((item) => item.id === id);
    if (!request) return;

    const updated = this.hrOps.updateLeaveStatus(id, 'Approved', this.userRole);
    if (!updated) return;

    this.toastService.showSuccess(`HR Tier-2 Final Approval granted for ${updated.employeeName}.`, 'HR Approved');
    this.hrOps.addSystemNotification(
      updated.employeeName,
      'Leave Approved',
      `Your leave from ${updated.fromDate} to ${updated.toDate} has been approved by HR.`,
    );
    this.leaveRequests = this.hrOps.getLeaveRequests();
    this.generateLeaveCalendar();
  }

  // Feature 4: Reject Leave
  openRejectModal(id: number): void {
    this.rejectingLeaveId = id;
    this.rejectionReason = '';
  }

  confirmReject(): void {
    if (!this.rejectingLeaveId) return;

    const updated = this.hrOps.updateLeaveStatus(
      this.rejectingLeaveId,
      'Rejected',
      this.userRole,
      this.rejectionReason.trim() || 'Insufficient project coverage'
    );

    if (updated) {
      this.toastService.showWarning(`Leave request rejected for ${updated.employeeName}.`, 'Leave Rejected');
      this.hrOps.addSystemNotification(
        updated.employeeName,
        'Leave Rejected',
        `Your leave request from ${updated.fromDate} to ${updated.toDate} was rejected: ${this.rejectionReason || 'Project coverage required'}`
      );
    }

    this.rejectingLeaveId = null;
    this.rejectionReason = '';
    this.leaveRequests = this.hrOps.getLeaveRequests();
  }

  // Feature 7: Interactive Leave Calendar Grid
  generateLeaveCalendar(): void {
    const year = new Date().getFullYear();
    const month = new Date().getMonth();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const days: CalendarLeaveDay[] = [];
    for (let i = 1; i <= totalDays; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const onLeave = this.leaveRequests
        .filter((req) => req.status === 'Approved' && req.fromDate <= dateStr && req.toDate >= dateStr)
        .map((req) => req.employeeName);

      days.push({
        date: dateStr,
        dayNumber: i,
        onLeaveNames: onLeave,
      });
    }

    this.calendarDays = days;
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
    if (diff < 0) return 0;
    return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
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

    if (this.currentEmployee || this.canReview) {
      this.errorMessage = '';
    } else {
      this.errorMessage =
        'Your employee profile was not found. Please login using your registered employee email.';
    }
  }
}
