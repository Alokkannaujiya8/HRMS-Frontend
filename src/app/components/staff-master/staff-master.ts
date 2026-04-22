import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { EmployeeUpsertPayload } from '../../models/employee.model';
import { StaffProfile } from '../../models/staff.model';
import { Employee } from '../../services/employee';
import { StaffData } from '../../services/staff-data';

@Component({
  selector: 'app-staff-master',
  standalone: false,
  templateUrl: './staff-master.html',
  styleUrl: './staff-master.scss',
})
export class StaffMaster implements OnInit {
  private readonly fb = inject(FormBuilder);

  editingEmployeeId: number | null = null;
  message = '';
  errorMessage = '';
  selectedDocuments: string[] = [];

  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    mobile: [''],
    division: ['Operations', Validators.required],
    designation: ['Associate', Validators.required],
    salary: [0, [Validators.required, Validators.min(0)]],
    is7thPay: [false],
    bankAccount: [''],
    ifsc: [''],
    pan: [''],
    dob: [''],
    gender: ['Male'],
    status: ['Active'],
    employmentType: ['Full-Time'],
    address: [''],
  });

  constructor(
    private employeeService: Employee,
    private staffData: StaffData,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    const employeeId = Number(this.route.snapshot.queryParamMap.get('employeeId'));
    if (employeeId) {
      this.editingEmployeeId = employeeId;
      this.prefill(employeeId);
    }

    this.form.controls.is7thPay.valueChanges.subscribe((enabled) => {
      if (enabled) {
        this.form.controls.salary.setValue(44900);
      }
    });
  }

  onDocumentChange(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    const files = target?.files;
    if (!files) {
      return;
    }
    this.selectedDocuments = Array.from(files).map((file) => file.name);
  }

  save(): void {
    this.errorMessage = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const payload: EmployeeUpsertPayload = {
      id: this.editingEmployeeId ?? undefined,
      name: value.name ?? '',
      email: value.email ?? '',
      mobile: value.mobile ?? '',
      salary: value.salary ?? 0,
      departmentId: 1,
      joinDate: new Date().toISOString().split('T')[0],
      photoUrl: '',
      documentUrl: '',
    };

    const request = this.editingEmployeeId
      ? this.employeeService.updateEmployee(payload)
      : this.employeeService.addEmployee(payload);

    request.subscribe({
      next: () => {
        if (this.editingEmployeeId) {
          this.saveProfile(this.editingEmployeeId);
          this.message = 'Employee updated successfully.';
          setTimeout(() => (this.message = ''), 2500);
          return;
        }

        this.employeeService.getEmployees().subscribe({
          next: (employees) => {
            const matched = (employees ?? []).find(
              (employee) => employee.email.toLowerCase() === (value.email ?? '').toLowerCase(),
            );
            this.saveProfile(matched?.id ?? 0);
            this.message = 'Employee onboarded successfully.';
            setTimeout(() => (this.message = ''), 2500);
          },
          error: () => {
            this.message = 'Employee onboarded, profile sync pending.';
            setTimeout(() => (this.message = ''), 2500);
          },
        });
      },
      error: (err: Error) => {
        this.errorMessage = err.message;
      },
    });
  }

  private prefill(employeeId: number): void {
    this.employeeService.getEmployee(employeeId).subscribe({
      next: (employee) => {
        const profile = this.staffData.getProfile(employeeId);
        this.selectedDocuments = profile.documents;
        this.form.patchValue({
          name: employee.name,
          email: employee.email,
          mobile: employee.mobile ?? '',
          salary: employee.salary ?? 0,
          division: profile.division,
          designation: profile.designation,
          bankAccount: profile.bankAccount,
          ifsc: profile.ifsc,
          pan: profile.pan,
          dob: profile.dob,
          gender: profile.gender,
          status: profile.status,
          employmentType: profile.employmentType,
          address: profile.address,
        });
      },
    });
  }

  private saveProfile(employeeId: number): void {
    const value = this.form.getRawValue();
    if (!employeeId) {
      return;
    }

    const existing = this.staffData.getProfile(employeeId);
    const profile: StaffProfile = {
      employeeId,
      division: value.division ?? 'Operations',
      designation: value.designation ?? 'Associate',
      address: value.address ?? '',
      dob: value.dob ?? '',
      gender: value.gender ?? 'Male',
      status: value.status ?? 'Active',
      employmentType: value.employmentType ?? 'Full-Time',
      bankAccount: value.bankAccount ?? '',
      ifsc: value.ifsc ?? '',
      pan: value.pan ?? '',
      skills: existing.skills,
      remarks: existing.remarks,
      documents: this.selectedDocuments,
      aadhaarVerified: existing.aadhaarVerified,
    };
    this.staffData.upsertProfile(profile);
  }
}
