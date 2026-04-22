export interface StaffProfile {
  employeeId: number;
  designation: string;
  division: string;
  address: string;
  dob: string;
  gender: string;
  status: string;
  employmentType: string;
  bankAccount: string;
  ifsc: string;
  pan: string;
  skills: string[];
  remarks: string[];
  documents: string[];
  aadhaarVerified: boolean;
}

export interface SalaryStructure {
  employeeId: number;
  basicSalary: number;
  incrementPercent: number;
  incrementAmount: number;
  effectiveDate: string;
  specialAllowance: number;
  deduction: number;
  totalSalary: number;
}

export interface MasterData {
  divisions: string[];
  designations: string[];
}

export interface BankRecord {
  employeeId: number;
  employeeCode: string;
  employeeName: string;
  bankName: string;
  ifscCode: string;
  accountNumber: string;
  createdDate: string;
  updatedDate: string;
  status: 'Active' | 'Inactive';
}
