import { Component, OnInit } from '@angular/core';
import { Employee } from '../services/employee';

@Component({
  selector: 'app-employee-test',
  standalone: false,
  templateUrl: './employee-test.html',
  styleUrl: './employee-test.scss',
})
export class EmployeeTest implements OnInit {
  employees: any = [];

  constructor(private service: Employee) {}

  ngOnInit(): void {
    this.loadEmployees();
  }
  loadEmployees(): void {
    this.service.getEmployees().subscribe({
      next: (data) => {
        this.employees = data; // API से आया डेटा array में सेव कर लिया
        console.log('Data fetched successfully', data);
      },
      error: (err) => {
        console.error('API Error:', err);
      },
    });
  }
}
