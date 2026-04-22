import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EmployeeRecord } from '../../models/employee.model';
import { StaffProfile } from '../../models/staff.model';
import { Employee } from '../../services/employee';
import { StaffData } from '../../services/staff-data';

@Component({
  selector: 'app-employee-details',
  standalone: false,
  templateUrl: './employee-details.html',
  styleUrl: './employee-details.scss',
})
export class EmployeeDetails implements OnInit {
  employee: EmployeeRecord | null = null;
  profile: StaffProfile | null = null;
  skillInput = '';
  remarkInput = '';
  message = '';

  constructor(
    private route: ActivatedRoute,
    private employeeService: Employee,
    private staffData: StaffData,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      return;
    }

    this.employeeService.getEmployee(id).subscribe({
      next: (employee) => {
        this.employee = employee;
        this.profile = this.staffData.getProfile(id);
      },
    });
  }

  generateLetter(type: 'Appointment' | 'Appraisal'): void {
    if (!this.employee) {
      return;
    }

    const body = `${type} Letter\n\nEmployee: ${this.employee.name}\nDate: ${new Date().toDateString()}`;
    const file = new Blob([body], { type: 'text/plain' });
    const url = URL.createObjectURL(file);
    window.open(url, '_blank', 'noopener');
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }

  addSkill(): void {
    if (!this.profile || !this.skillInput.trim()) {
      return;
    }
    this.profile.skills = [this.skillInput.trim(), ...this.profile.skills];
    this.skillInput = '';
    this.persistProfile('Skill added successfully.');
  }

  addRemark(): void {
    if (!this.profile || !this.remarkInput.trim()) {
      return;
    }
    this.profile.remarks = [this.remarkInput.trim(), ...this.profile.remarks];
    this.remarkInput = '';
    this.persistProfile('Remark added successfully.');
  }

  uploadDocuments(event: Event): void {
    if (!this.profile) {
      return;
    }

    const target = event.target as HTMLInputElement | null;
    const files = target?.files;
    if (!files || files.length === 0) {
      return;
    }

    const names = Array.from(files).map((file) => file.name);
    this.profile.documents = [...names, ...this.profile.documents];
    this.persistProfile('Documents uploaded in record.');
  }

  verifyAadhaar(): void {
    if (!this.profile) {
      return;
    }
    this.profile.aadhaarVerified = true;
    this.persistProfile('Aadhaar verified.');
  }

  private persistProfile(message: string): void {
    if (!this.profile) {
      return;
    }
    this.staffData.upsertProfile(this.profile);
    this.message = message;
    setTimeout(() => (this.message = ''), 3000);
  }
}
