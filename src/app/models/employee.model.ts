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
}

export type EmployeeUpsertPayload = Omit<EmployeeRecord, 'id'> & { id?: number };

export const EMPTY_EMPLOYEE: EmployeeUpsertPayload = {
  name: '',
  email: '',
  mobile: '',
  salary: null,
  departmentId: null,
  joinDate: '',
};
