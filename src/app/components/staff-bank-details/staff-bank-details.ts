import { Component, OnInit } from '@angular/core';
import { EmployeeRecord } from '../../models/employee.model';
import { BankRecord } from '../../models/staff.model';
import { Employee } from '../../services/employee';
import { StaffData } from '../../services/staff-data';

@Component({
  selector: 'app-staff-bank-details',
  standalone: false,
  templateUrl: './staff-bank-details.html',
  styleUrl: './staff-bank-details.scss',
})
export class StaffBankDetails implements OnInit {
  employees: EmployeeRecord[] = [];
  bankRecords: BankRecord[] = [];
  selectedEmployeeId: number | null = null;
  bankName = '';
  ifscCode = '';
  accountNumber = '';
  status: 'Active' | 'Inactive' = 'Active';
  message = '';

  constructor(
    private employeeService: Employee,
    private staffData: StaffData,
  ) {}

  ngOnInit(): void {
    this.employeeService.getEmployees().subscribe({
      next: (employees) => {
        this.employees = employees ?? [];
        if (this.employees.length > 0) {
          this.selectedEmployeeId = this.employees[0].id;
        }
      },
    });
    this.loadRecords();
  }

  verifyIfsc(): void {
    this.message = this.ifscCode.trim().length >= 8 ? 'IFSC looks valid.' : 'Please enter a valid IFSC.';
    setTimeout(() => (this.message = ''), 2200);
  }

  updateRecord(): void {
    if (!this.selectedEmployeeId || !this.bankName.trim() || !this.ifscCode.trim() || !this.accountNumber.trim()) {
      this.message = 'All fields are required.';
      setTimeout(() => (this.message = ''), 2200);
      return;
    }

    const employee = this.employees.find((item) => item.id === this.selectedEmployeeId);
    if (!employee) {
      return;
    }

    this.staffData.upsertBankRecord({
      employeeId: employee.id,
      employeeCode: `JOPL/${employee.id}`,
      employeeName: employee.name,
      bankName: this.bankName.trim(),
      ifscCode: this.ifscCode.trim().toUpperCase(),
      accountNumber: this.accountNumber.trim(),
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
      status: this.status,
    });
    this.loadRecords();
    this.message = 'Bank details updated.';
    setTimeout(() => (this.message = ''), 2200);
  }

  private loadRecords(): void {
    this.bankRecords = this.staffData.getBankRecords();
  }
}
