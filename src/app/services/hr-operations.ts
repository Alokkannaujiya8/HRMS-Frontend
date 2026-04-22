import { Injectable } from '@angular/core';
import {
  AttendanceEntry,
  AuditEntry,
  LeaveRequest,
  LeaveStatus,
  NotificationEvent,
} from '../models/hr-ops.model';

@Injectable({
  providedIn: 'root',
})
export class HrOperations {
  private readonly attendanceKey = 'hrms_attendance_entries';
  private readonly leaveKey = 'hrms_leave_requests';
  private readonly auditKey = 'hrms_audit_entries';
  private readonly notificationKey = 'hrms_notifications';

  getAttendanceEntries(): AttendanceEntry[] {
    return this.read<AttendanceEntry[]>(this.attendanceKey, []);
  }

  saveAttendanceEntries(entries: AttendanceEntry[]): void {
    this.write(this.attendanceKey, entries);
  }

  upsertAttendance(entry: Omit<AttendanceEntry, 'id' | 'markedAt'>): AttendanceEntry {
    const entries = this.getAttendanceEntries();
    const existing = entries.find(
      (item) => item.employeeId === entry.employeeId && item.date === entry.date,
    );

    if (existing) {
      existing.status = entry.status;
      existing.checkIn = entry.checkIn;
      existing.checkOut = entry.checkOut;
      existing.notes = entry.notes;
      existing.markedBy = entry.markedBy;
      existing.markedAt = new Date().toISOString();
      this.saveAttendanceEntries(entries);
      return existing;
    }

    const created: AttendanceEntry = {
      ...entry,
      id: Date.now(),
      markedAt: new Date().toISOString(),
    };
    entries.unshift(created);
    this.saveAttendanceEntries(entries);
    return created;
  }

  getLeaveRequests(): LeaveRequest[] {
    return this.read<LeaveRequest[]>(this.leaveKey, []);
  }

  addLeaveRequest(payload: Omit<LeaveRequest, 'id' | 'status' | 'requestedAt'>): LeaveRequest {
    const request: LeaveRequest = {
      ...payload,
      id: Date.now(),
      status: 'Pending',
      requestedAt: new Date().toISOString(),
    };
    const requests = this.getLeaveRequests();
    requests.unshift(request);
    this.write(this.leaveKey, requests);
    return request;
  }

  updateLeaveStatus(id: number, status: LeaveStatus, reviewedBy: string, rejectReason = ''): LeaveRequest | null {
    const requests = this.getLeaveRequests();
    const target = requests.find((item) => item.id === id);
    if (!target) {
      return null;
    }

    target.status = status;
    target.reviewedBy = reviewedBy;
    target.reviewedAt = new Date().toISOString();
    target.rejectReason = status === 'Rejected' ? rejectReason : '';
    this.write(this.leaveKey, requests);
    return target;
  }

  getAuditEntries(): AuditEntry[] {
    return this.read<AuditEntry[]>(this.auditKey, []);
  }

  addAudit(entry: Omit<AuditEntry, 'id' | 'changedAt'>): AuditEntry {
    const audit: AuditEntry = {
      ...entry,
      id: Date.now(),
      changedAt: new Date().toISOString(),
    };
    const audits = this.getAuditEntries();
    audits.unshift(audit);
    this.write(this.auditKey, audits);
    return audit;
  }

  getNotifications(): NotificationEvent[] {
    return this.read<NotificationEvent[]>(this.notificationKey, []);
  }

  queueEmail(recipient: string, title: string, message: string, provider: 'SMTP' | 'SendGrid'): NotificationEvent {
    const notification: NotificationEvent = {
      id: Date.now(),
      type: 'Email',
      title,
      recipient,
      message,
      provider,
      status: 'Sent',
      createdAt: new Date().toISOString(),
    };
    const notifications = this.getNotifications();
    notifications.unshift(notification);
    this.write(this.notificationKey, notifications);
    return notification;
  }

  addSystemNotification(recipient: string, title: string, message: string): NotificationEvent {
    const notification: NotificationEvent = {
      id: Date.now(),
      type: 'System',
      title,
      recipient,
      message,
      provider: 'In-App',
      status: 'Sent',
      createdAt: new Date().toISOString(),
    };
    const notifications = this.getNotifications();
    notifications.unshift(notification);
    this.write(this.notificationKey, notifications);
    return notification;
  }

  private read<T>(key: string, fallback: T): T {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }

    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }

  private write(key: string, value: unknown): void {
    localStorage.setItem(key, JSON.stringify(value));
  }
}
