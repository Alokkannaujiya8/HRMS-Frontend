import { Component } from '@angular/core';

@Component({
  selector: 'app-hr-shell',
  standalone: false,
  templateUrl: './hr-shell.html',
  styleUrl: './hr-shell.scss',
})
export class HrShell {
  role = (localStorage.getItem('role') ?? 'employee').trim().toLowerCase();

  get isAdmin(): boolean {
    return this.role === 'admin';
  }

  get isHr(): boolean {
    return this.role === 'hr';
  }

  get panelTitle(): string {
    return this.isAdmin ? 'Admin Modules' : 'HR Modules';
  }
}
