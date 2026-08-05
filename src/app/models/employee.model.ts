export interface Department {
  id: number;
  name: string;
}

export interface EmployeeRecord {
  id: number;
  name: string;
  email: string;
  mobile: string | null;
  salary: number | null;
  departmentId: number | null;
  joinDate: string | null;
  photoUrl: string | null;
  documentUrl: string | null;
  role?: string | null;
  shift?: string | null;
  createLogin?: boolean;
}

export type EmployeeUpsertPayload = Omit<EmployeeRecord, 'id'> & { id?: number };

export const EMPTY_EMPLOYEE: EmployeeUpsertPayload = {
  name: '',
  email: '',
  mobile: '',
  salary: null,
  departmentId: null,
  joinDate: '',
  photoUrl: '',
  documentUrl: '',
  role: 'Employee',
  shift: 'Day Shift (09:00 AM - 06:00 PM)',
  createLogin: true,
};
