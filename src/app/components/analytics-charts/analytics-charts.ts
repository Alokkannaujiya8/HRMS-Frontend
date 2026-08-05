import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-analytics-charts',
  standalone: false,
  templateUrl: './analytics-charts.html',
  styleUrl: './analytics-charts.scss',
})
export class AnalyticsCharts implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('lineChartCanvas') lineChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('pieChartCanvas') pieChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('doughnutChartCanvas') doughnutChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('barChartCanvas') barChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('areaChartCanvas') areaChartCanvas!: ElementRef<HTMLCanvasElement>;

  private lineChart!: Chart;
  private pieChart!: Chart;
  private doughnutChart!: Chart;
  private barChart!: Chart;
  private areaChart!: Chart;

  selectedPeriod = '2026';

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.renderLineChart();
    this.renderPieChart();
    this.renderDoughnutChart();
    this.renderBarChart();
    this.renderAreaChart();
  }

  ngOnDestroy(): void {
    if (this.lineChart) this.lineChart.destroy();
    if (this.pieChart) this.pieChart.destroy();
    if (this.doughnutChart) this.doughnutChart.destroy();
    if (this.barChart) this.barChart.destroy();
    if (this.areaChart) this.areaChart.destroy();
  }

  // 1. Line Chart: Monthly Attendance & Punctuality Trend
  private renderLineChart(): void {
    const ctx = this.lineChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    this.lineChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
        datasets: [
          {
            label: 'Present Rate (%)',
            data: [92, 94, 91, 95, 96, 93, 97, 98],
            borderColor: '#38bdf8',
            backgroundColor: 'rgba(56, 189, 248, 0.15)',
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#38bdf8'
          },
          {
            label: 'On-Time Punctuality (%)',
            data: [85, 88, 87, 90, 92, 89, 94, 95],
            borderColor: '#4ade80',
            backgroundColor: 'transparent',
            tension: 0.4,
            borderDash: [5, 5],
            pointBackgroundColor: '#4ade80'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#cbd5e1' } }
        },
        scales: {
          x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.06)' } },
          y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.06)' }, min: 70, max: 100 }
        }
      }
    });
  }

  // 2. Pie Chart: Department Headcount & Workforce Distribution
  private renderPieChart(): void {
    const ctx = this.pieChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    this.pieChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Engineering', 'Human Resources', 'Sales & Marketing', 'Finance', 'Operations'],
        datasets: [
          {
            data: [42, 12, 24, 10, 12],
            backgroundColor: ['#0ea5e9', '#818cf8', '#f59e0b', '#10b981', '#ec4899'],
            borderWidth: 2,
            borderColor: '#0f172a'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right', labels: { color: '#cbd5e1', font: { size: 12 } } }
        }
      }
    });
  }

  // 3. Doughnut Chart: Leave Category Distribution
  private renderDoughnutChart(): void {
    const ctx = this.doughnutChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    this.doughnutChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Casual Leave', 'Sick Leave', 'Earned Leave', 'Unpaid Leave'],
        datasets: [
          {
            data: [45, 25, 20, 10],
            backgroundColor: ['#38bdf8', '#fb7185', '#a855f7', '#94a3b8'],
            borderWidth: 3,
            borderColor: '#0f172a'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: { position: 'bottom', labels: { color: '#cbd5e1' } }
        }
      }
    });
  }

  // 4. Bar Chart: Monthly Payroll Expense vs Overtime Costs
  private renderBarChart(): void {
    const ctx = this.barChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    this.barChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        datasets: [
          {
            label: 'Base Salaries (₹ in L)',
            data: [12.5, 12.8, 13.0, 13.2, 13.5, 14.0, 14.5],
            backgroundColor: '#6366f1',
            borderRadius: 6
          },
          {
            label: 'Overtime Pay (₹ in L)',
            data: [1.2, 1.4, 1.1, 1.5, 1.8, 1.6, 2.0],
            backgroundColor: '#f97316',
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#cbd5e1' } }
        },
        scales: {
          x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.06)' } },
          y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.06)' } }
        }
      }
    });
  }

  // 5. Area Chart: Employee Growth & Attrition Trajectory
  private renderAreaChart(): void {
    const ctx = this.areaChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    this.areaChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025', 'Q1 2026', 'Q2 2026', 'Q3 2026'],
        datasets: [
          {
            label: 'New Hires Count',
            data: [12, 18, 15, 22, 20, 25, 28],
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.25)',
            fill: true,
            tension: 0.4
          },
          {
            label: 'Departures / Attrition',
            data: [3, 4, 2, 5, 3, 2, 4],
            borderColor: '#f43f5e',
            backgroundColor: 'rgba(244, 63, 94, 0.25)',
            fill: true,
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#cbd5e1' } }
        },
        scales: {
          x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.06)' } },
          y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.06)' } }
        }
      }
    });
  }
}
