import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { Department, EmployeeRecord } from '../../models/employee.model';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnChanges, AfterViewInit, OnDestroy {
  @ViewChild('departmentChart') chartCanvas?: ElementRef<HTMLCanvasElement>;

  @Input() employees: EmployeeRecord[] = [];
  @Input() departments: Department[] = [];

  totalSalary = 0;
  activeEmployeesCount = 0;
  private viewInitialized = false;
  private myChart?: Chart<'bar', number[], string>;

  ngAfterViewInit(): void {
    this.viewInitialized = true;
    this.updateDashboard();
  }

  ngOnDestroy(): void {
    this.myChart?.destroy();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['employees'] || changes['departments']) {
      this.updateDashboard();
    }
  }
  updateDashboard(): void {
    this.activeEmployeesCount = this.employees.length;
    this.totalSalary = this.employees.reduce((sum, emp) => sum + (emp.salary ?? 0), 0);

    const deptCounts: Record<string, number> = {};
    this.departments.forEach((department) => {
      deptCounts[department.name] = 0;
    });

    this.employees.forEach((employee) => {
      const department = this.departments.find((dept) => dept.id === employee.departmentId);
      if (department) {
        deptCounts[department.name]++;
      }
    });

    if (this.viewInitialized) {
      this.renderChart(Object.keys(deptCounts), Object.values(deptCounts));
    }
  }

  renderChart(labels: string[], data: number[]): void {
    const canvas = this.chartCanvas?.nativeElement;
    if (!canvas) {
      return;
    }

    this.myChart?.destroy();
    this.myChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Employees',
          data: data,
          backgroundColor: ['#00b2ff', '#50cd89', '#f1416c', '#ffc700', '#7239ea'],
          borderRadius: 6,
        }],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, ticks: { color: '#a1a5b7', stepSize: 1 } },
          x: { ticks: { color: '#a1a5b7' } },
        },
      },
    });
  }
}
