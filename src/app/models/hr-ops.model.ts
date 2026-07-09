export type AttendanceStatus = 'Present' | 'Absent' | 'WFH' | 'Half Day';
export type AttendanceDayType = 'Regular' | 'Weekend' | 'Holiday';

export interface AttendanceEntry {
  id: number;
  employeeId: number;
  employeeName: string;
  date: string;
  status: AttendanceStatus;
  checkIn: string;
  checkOut: string;
  notes: string;
  markedBy: string;
  markedAt: string;
  dayType?: AttendanceDayType;
  standardWorkingHours?: number;
  monthlyWorkingDays?: number;
  workedHours?: number;
  overtimeHours?: number;
  overtimeMultiplier?: number;
  hourlySalary?: number;
  overtimeAmount?: number;
}

export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';

export interface LeaveRequest {
  id: number;
  employeeId: number;
  employeeName: string;
  leaveType: 'Casual' | 'Sick' | 'Earned';
  fromDate: string;
  toDate: string;
  reason: string;
  status: LeaveStatus;
  requestedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectReason?: string;
}

export interface AuditEntry {
  id: number;
  action: string;
  module: 'Employee' | 'Attendance' | 'Leave' | 'Notification' | 'Reporting';
  changedBy: string;
  changedAt: string;
  details: string;
}

export interface NotificationEvent {
  id: number;
  type: 'Email' | 'System';
  title: string;
  recipient: string;
  message: string;
  provider: 'SMTP' | 'SendGrid' | 'In-App';
  status: 'Queued' | 'Sent' | 'Failed';
  createdAt: string;
}
