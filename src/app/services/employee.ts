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

  private handleError(error: HttpErrorResponse, operation: string): Observable<never> {
    const message = error.error?.message || error.message || `Unable to ${operation}.`;
    return throwError(() => new Error(message));
  }
}
