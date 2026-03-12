import { Component, OnInit } from '@angular/core';
import { Employee } from '../services/employee';

@Component({
  selector: 'app-employee-test',
  standalone: false,
  templateUrl: './employee-test.html',
  styleUrl: './employee-test.scss',
})
export class EmployeeTest implements OnInit{
employees:any=[]

constructor(private service:Employee){}


ngOnInit() {
    this.service.getEmployees().subscribe({
      next: (res) => {
        
        this.employees = res; 
        console.log("Data loaded from API:", this.employees); 
      },
      error: (err) => {
        console.error("API Error:", err);
      }
    });
}
}
