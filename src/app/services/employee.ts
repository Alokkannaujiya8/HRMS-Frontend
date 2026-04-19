import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { EmployeeRecord, EmployeeUpsertPayload } from '../models/employee.model';

@Injectable({
  providedIn: 'root',
})
export class Employee {
  private readonly apiUrl = 'https://localhost:7147/api/employee';

  constructor(private http: HttpClient) {}

  getEmployees(): Observable<EmployeeRecord[]> {
    return this.http
      .get<EmployeeRecord[]>(this.apiUrl)
      .pipe(catchError((error) => this.handleError(error, 'fetch employees')));
  }

  getEmployee(id: number): Observable<EmployeeRecord> {
    return this.http
      .get<EmployeeRecord>(`${this.apiUrl}/${id}`)
      .pipe(catchError((error) => this.handleError(error, 'fetch employee')));
  }

  addEmployee(emp: EmployeeUpsertPayload): Observable<string> {
    return this.http
      .post(this.apiUrl, emp, { responseType: 'text' })
      .pipe(catchError((error) => this.handleError(error, 'add employee')));
  }

  updateEmployee(emp: EmployeeUpsertPayload): Observable<string> {
    return this.http
      .put(this.apiUrl, emp, { responseType: 'text' })
      .pipe(catchError((error) => this.handleError(error, 'update employee')));
  }

  deleteEmployee(id: number): Observable<string> {
    return this.http
      .delete(`${this.apiUrl}/${id}`, { responseType: 'text' })
      .pipe(catchError((error) => this.handleError(error, 'delete employee')));
  }

  uploadPhoto(file: File): Observable<Record<string, unknown>> {
    return this.uploadFile(file, 'photo');
  }

  uploadDocument(file: File): Observable<Record<string, unknown>> {
    return this.uploadFile(file, 'document');
  }

  private uploadFile(file: File, type: 'photo' | 'document'): Observable<Record<string, unknown>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    return this.http
      .post<Record<string, unknown>>(`${this.apiUrl}/upload`, formData)
      .pipe(catchError((error) => this.handleError(error, `upload ${type}`)));
  }

  private handleError(error: HttpErrorResponse, operation: string): Observable<never> {
    const validationErrors = error.error?.errors && typeof error.error.errors === 'object'
      ? Object.values(error.error.errors as Record<string, string[]>).flat().join(' ')
      : '';

    const message =
      validationErrors ||
      error.error?.message ||
      error.error?.title ||
      error.message ||
      `Unable to ${operation}.`;
    return throwError(() => new Error(message));
  }
}
