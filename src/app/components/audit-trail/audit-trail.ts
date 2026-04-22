import { Component, OnInit } from '@angular/core';
import { AuditEntry } from '../../models/hr-ops.model';
import { HrOperations } from '../../services/hr-operations';

@Component({
  selector: 'app-audit-trail',
  standalone: false,
  templateUrl: './audit-trail.html',
  styleUrl: './audit-trail.scss',
})
export class AuditTrail implements OnInit {
  audits: AuditEntry[] = [];
  moduleFilter = 'All';
  modules = ['All', 'Employee', 'Attendance', 'Leave', 'Notification', 'Reporting'];

  constructor(private hrOps: HrOperations) {}

  ngOnInit(): void {
    this.refresh();
  }

  get filteredAudits(): AuditEntry[] {
    if (this.moduleFilter === 'All') {
      return this.audits;
    }

    return this.audits.filter((audit) => audit.module === this.moduleFilter);
  }

  refresh(): void {
    this.audits = this.hrOps.getAuditEntries();
  }
}
