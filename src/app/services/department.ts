import { Injectable } from '@angular/core';
import { DepartmentItem } from '../models/department.model';

@Injectable({
  providedIn: 'root',
})
export class DepartmentService {
  private readonly storageKey = 'hrms_departments';

  getDepartments(): DepartmentItem[] {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) {
      const seeded = this.seedDepartments();
      this.saveDepartments(seeded);
      return seeded;
    }

    try {
      return JSON.parse(raw) as DepartmentItem[];
    } catch {
      return [];
    }
  }

  addDepartment(name: string, code: string): { success: boolean; message: string } {
    const departments = this.getDepartments();
    const normalizedCode = code.trim().toUpperCase();
    const alreadyExists = departments.some((dept) => dept.code.toUpperCase() === normalizedCode);
    if (alreadyExists) {
      return { success: false, message: 'Department code already exists.' };
    }

    departments.unshift({
      id: Date.now(),
      name: name.trim(),
      code: normalizedCode,
      createdAt: new Date().toISOString(),
    });
    this.saveDepartments(departments);
    return { success: true, message: 'Department added successfully.' };
  }

  deleteDepartment(id: number): void {
    const updated = this.getDepartments().filter((dept) => dept.id !== id);
    this.saveDepartments(updated);
  }

  private saveDepartments(departments: DepartmentItem[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(departments));
  }

  private seedDepartments(): DepartmentItem[] {
    return [
      { id: 1, name: 'Human Resources', code: 'HR', createdAt: new Date().toISOString() },
      { id: 2, name: 'Information Technology', code: 'IT', createdAt: new Date().toISOString() },
      { id: 3, name: 'Finance', code: 'FIN', createdAt: new Date().toISOString() },
    ];
  }
}
