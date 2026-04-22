import { Component, OnInit } from '@angular/core';
import { NotificationEvent } from '../../models/hr-ops.model';
import { HrOperations } from '../../services/hr-operations';

@Component({
  selector: 'app-notifications',
  standalone: false,
  templateUrl: './notifications.html',
  styleUrl: './notifications.scss',
})
export class Notifications implements OnInit {
  notifications: NotificationEvent[] = [];
  recipient = '';
  title = '';
  message = '';
  provider: 'SMTP' | 'SendGrid' = 'SMTP';
  userRole = localStorage.getItem('role') ?? 'Employee';

  constructor(private hrOps: HrOperations) {}

  ngOnInit(): void {
    this.refresh();
  }

  sendTestEmail(): void {
    if (!this.recipient.trim() || !this.title.trim() || !this.message.trim()) {
      return;
    }

    this.hrOps.queueEmail(
      this.recipient.trim(),
      this.title.trim(),
      this.message.trim(),
      this.provider,
    );
    this.hrOps.addAudit({
      action: 'Notification Sent',
      module: 'Notification',
      changedBy: this.userRole,
      details: `Email sent to ${this.recipient.trim()} using ${this.provider}.`,
    });
    this.title = '';
    this.message = '';
    this.refresh();
  }

  refresh(): void {
    this.notifications = this.hrOps.getNotifications();
  }
}
