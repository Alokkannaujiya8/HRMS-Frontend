import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { NotificationEvent } from '../../models/hr-ops.model';
import { HrOperations } from '../../services/hr-operations';

@Component({
  selector: 'app-notifications',
  standalone: false,
  templateUrl: './notifications.html',
  styleUrl: './notifications.scss',
})
export class Notifications implements OnInit {
  notifications: WritableSignal<NotificationEvent[]> = signal<NotificationEvent[]>([]);
  recipient: WritableSignal<string> = signal<string>('');
  title: WritableSignal<string> = signal<string>('');
  message: WritableSignal<string> = signal<string>('');
  provider: WritableSignal<'SMTP' | 'SendGrid'> = signal<'SMTP' | 'SendGrid'>('SMTP');
  userRole = localStorage.getItem('role') ?? 'Employee';

  constructor(private hrOps: HrOperations) {}

  ngOnInit(): void {
    this.refresh();
  }

  sendTestEmail(): void {
    const rec = this.recipient().trim();
    const t = this.title().trim();
    const m = this.message().trim();

    if (!rec || !t || !m) {
      return;
    }

    this.hrOps.queueEmail(rec, t, m, this.provider());
    this.hrOps.addAudit({
      action: 'Notification Sent',
      module: 'Notification',
      changedBy: this.userRole,
      details: `Email sent to ${rec} using ${this.provider()}.`,
    });
    this.title.set('');
    this.message.set('');
    this.refresh();
  }

  refresh(): void {
    this.notifications.set(this.hrOps.getNotifications());
  }
}
