import { Component,Input, Output, EventEmitter } from '@angular/core';
import { EmployeeRecord } from '../../models/employee.model';
import { buildFileUrl } from '../../utils/file-url';

@Component({
  selector: 'app-employee-list',
  standalone: false,
  templateUrl: './employee-list.html',
  styleUrl: './employee-list.scss',
})
export class EmployeeList {
  @Input() employees: EmployeeRecord[] = [];
  @Input() userRole: string = '';

  @Output() onEdit = new EventEmitter<EmployeeRecord>();
  @Output() onDelete = new EventEmitter<number>();

  searchText: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 5;

  get filteredEmployees() {
    if (!this.searchText) return this.employees;
    const search = this.searchText.trim().toLowerCase();
    return this.employees.filter((emp) =>
      emp.name.toLowerCase().includes(search) || emp.email.toLowerCase().includes(search),
    );
  }

  get paginatedEmployees() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredEmployees.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages() { return Math.ceil(this.filteredEmployees.length / this.itemsPerPage); }
  nextPage() { if (this.currentPage < this.totalPages) this.currentPage++; }
  prevPage() { if (this.currentPage > 1) this.currentPage--; }
  onSearchChange() { this.currentPage = 1; }

  edit(emp: EmployeeRecord) { this.onEdit.emit(emp); }

  delete(id: number | null | undefined) {
    if (typeof id === 'number') {
      this.onDelete.emit(id);
    }
  }

  getPhotoUrl(photoUrl: string | null): string {
    return buildFileUrl(photoUrl) || 'assets/dummy-user.png';
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement | null;
    if (!img || img.src.endsWith('/assets/dummy-user.png')) {
      return;
    }
    img.src = 'assets/dummy-user.png';
  }
}
