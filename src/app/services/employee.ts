import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Employee {
  apiUrl = "https://localhost:7147/api/employee"

  constructor(private http: HttpClient) {}

  getEmployees(){
    return this.http.get(this.apiUrl)
  }

  addEmployee(emp:any){
    return this.http.post(this.apiUrl,emp)
  }
}
