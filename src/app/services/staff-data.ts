import { Injectable } from '@angular/core';
import { EmployeeRecord } from '../models/employee.model';
import { BankRecord, MasterData, SalaryStructure, StaffProfile } from '../models/staff.model';

@Injectable({
  providedIn: 'root',
})
export class StaffData {
  private readonly profilesKey = 'hrms_staff_profiles';
  private readonly salaryKey = 'hrms_salary_structures';
  private readonly masterKey = 'hrms_master_data';
  private readonly bankKey = 'hrms_bank_records';

  syncEmployees(employees: EmployeeRecord[]): void {
    const profiles = this.getProfiles();
    const salaries = this.getSalaryStructures();

    const profileMap = new Map(profiles.map((profile) => [profile.employeeId, profile]));
    const salaryMap = new Map(salaries.map((salary) => [salary.employeeId, salary]));

    employees.forEach((employee) => {
      if (!profileMap.has(employee.id)) {
        profiles.push(this.createDefaultProfile(employee.id));
      }

      if (!salaryMap.has(employee.id)) {
        const base = employee.salary ?? 0;
        salaries.push({
          employeeId: employee.id,
          basicSalary: base,
          incrementPercent: 0,
          incrementAmount: 0,
          effectiveDate: employee.joinDate ?? '',
          specialAllowance: 0,
          deduction: 0,
          totalSalary: base,
        });
      }
    });

    this.saveProfiles(profiles);
    this.saveSalaryStructures(salaries);
  }

  getProfiles(): StaffProfile[] {
    return this.read<StaffProfile[]>(this.profilesKey, []);
  }

  getProfile(employeeId: number): StaffProfile {
    const profiles = this.getProfiles();
    const existing = profiles.find((item) => item.employeeId === employeeId);
    return existing ?? this.createDefaultProfile(employeeId);
  }

  upsertProfile(profile: StaffProfile): void {
    const profiles = this.getProfiles();
    const index = profiles.findIndex((item) => item.employeeId === profile.employeeId);
    if (index >= 0) {
      profiles[index] = profile;
    } else {
      profiles.push(profile);
    }
    this.saveProfiles(profiles);
  }

  getSalaryStructures(): SalaryStructure[] {
    return this.read<SalaryStructure[]>(this.salaryKey, []);
  }

  getSalary(employeeId: number): SalaryStructure {
    const salaries = this.getSalaryStructures();
    const existing = salaries.find((item) => item.employeeId === employeeId);
    return existing ?? this.createDefaultSalary(employeeId);
  }

  upsertSalary(salary: SalaryStructure): void {
    const salaries = this.getSalaryStructures();
    const index = salaries.findIndex((item) => item.employeeId === salary.employeeId);
    if (index >= 0) {
      salaries[index] = salary;
    } else {
      salaries.push(salary);
    }
    this.saveSalaryStructures(salaries);
  }

  getMasterData(): MasterData {
    return this.read<MasterData>(this.masterKey, {
      divisions: ['Operations', 'Corporate', 'Field'],
      designations: ['Associate', 'Executive', 'Manager'],
    });
  }

  addDivision(value: string): void {
    const master = this.getMasterData();
    const normalized = value.trim();
    if (!normalized || master.divisions.includes(normalized)) {
      return;
    }
    master.divisions.push(normalized);
    this.saveMasterData(master);
  }

  addDesignation(value: string): void {
    const master = this.getMasterData();
    const normalized = value.trim();
    if (!normalized || master.designations.includes(normalized)) {
      return;
    }
    master.designations.push(normalized);
    this.saveMasterData(master);
  }

  deleteDivision(value: string): void {
    const master = this.getMasterData();
    master.divisions = master.divisions.filter((item) => item !== value);
    this.saveMasterData(master);
  }

  deleteDesignation(value: string): void {
    const master = this.getMasterData();
    master.designations = master.designations.filter((item) => item !== value);
    this.saveMasterData(master);
  }

  getBankRecords(): BankRecord[] {
    return this.read<BankRecord[]>(this.bankKey, []);
  }

  upsertBankRecord(record: BankRecord): void {
    const records = this.getBankRecords();
    const index = records.findIndex((item) => item.employeeId === record.employeeId);
    if (index >= 0) {
      records[index] = {
        ...record,
        createdDate: records[index].createdDate,
        updatedDate: new Date().toISOString(),
      };
    } else {
      records.unshift(record);
    }
    this.write(this.bankKey, records);
  }

  private createDefaultProfile(employeeId: number): StaffProfile {
    return {
      employeeId,
      designation: 'Associate',
      division: 'Operations',
      address: '',
      dob: '',
      gender: 'Male',
      status: 'Active',
      employmentType: 'Full-Time',
      bankAccount: '',
      ifsc: '',
      pan: '',
      skills: [],
      remarks: [],
      documents: [],
      aadhaarVerified: false,
    };
  }

  private createDefaultSalary(employeeId: number): SalaryStructure {
    return {
      employeeId,
      basicSalary: 0,
      incrementPercent: 0,
      incrementAmount: 0,
      effectiveDate: '',
      specialAllowance: 0,
      deduction: 0,
      totalSalary: 0,
    };
  }

  private saveProfiles(profiles: StaffProfile[]): void {
    this.write(this.profilesKey, profiles);
  }

  private saveSalaryStructures(salaries: SalaryStructure[]): void {
    this.write(this.salaryKey, salaries);
  }

  private saveMasterData(master: MasterData): void {
    this.write(this.masterKey, master);
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
