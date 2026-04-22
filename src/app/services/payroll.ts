import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Payroll {
  private readonly apiUrl = 'https://localhost:7147/api/payroll';

  constructor(private http: HttpClient) {}

  downloadPayslip(month: number, year: number): Observable<HttpResponse<Blob>> {
    const params = new HttpParams()
      .set('month', month.toString())
      .set('year', year.toString());

    return this.http.get(`${this.apiUrl}/payslip`, {
      params,
      responseType: 'blob',
      observe: 'response',
    });
  }
}
