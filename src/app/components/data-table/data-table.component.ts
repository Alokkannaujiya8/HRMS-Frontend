import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';

export interface ColumnDefinition {
  field: string;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  type?: 'text' | 'number' | 'date' | 'currency' | 'badge';
  width?: string;
}

@Component({
  selector: 'app-data-table',
  standalone: false,
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss',
})
export class DataTableComponent<T extends Record<string, any>> implements OnInit, OnChanges {
  @Input() columns: ColumnDefinition[] = [];
  @Input() data: T[] = [];
  @Input() title = 'Enterprise Data Table';
  @Input() subtitle = 'Manage and filter records';
  @Input() pageSize = 10;

  @Output() rowClick = new EventEmitter<T>();
  @Output() exportExcel = new EventEmitter<void>();

  filteredData: T[] = [];
  paginatedData: T[] = [];

  globalSearchQuery = '';
  columnFilters: Record<string, string> = {};

  sortColumn: string | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';

  currentPage = 1;
  totalPages = 1;
  pageSizeOptions = [10, 25, 50, 100];

  ngOnInit(): void {
    this.applyFiltersAndPagination();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.applyFiltersAndPagination();
    }
  }

  onGlobalSearchChange(): void {
    this.currentPage = 1;
    this.applyFiltersAndPagination();
  }

  onColumnFilterChange(field: string, value: string): void {
    this.columnFilters[field] = value.trim().toLowerCase();
    this.currentPage = 1;
    this.applyFiltersAndPagination();
  }

  onSort(field: string): void {
    if (this.sortColumn === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = field;
      this.sortDirection = 'asc';
    }
    this.applyFiltersAndPagination();
  }

  onPageSizeChange(newSize: number): void {
    this.pageSize = newSize;
    this.currentPage = 1;
    this.applyFiltersAndPagination();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedData();
    }
  }

  exportToCsv(): void {
    if (!this.filteredData.length) return;

    const headers = this.columns.map(col => col.header).join(',');
    const rows = this.filteredData.map(row =>
      this.columns.map(col => {
        const val = row[col.field];
        return `"${val !== undefined && val !== null ? String(val).replace(/"/g, '""') : ''}"`;
      }).join(',')
    );

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${this.title.toLowerCase().replace(/\s+/g, '_')}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  triggerExcelExport(): void {
    this.exportExcel.emit();
  }

  private applyFiltersAndPagination(): void {
    let result = [...this.data];

    // 1. Global Search Filter
    if (this.globalSearchQuery.trim()) {
      const q = this.globalSearchQuery.trim().toLowerCase();
      result = result.filter(row =>
        this.columns.some(col => {
          const val = row[col.field];
          return val !== undefined && val !== null && String(val).toLowerCase().includes(q);
        })
      );
    }

    // 2. Column Filters
    Object.keys(this.columnFilters).forEach(field => {
      const filterVal = this.columnFilters[field];
      if (filterVal) {
        result = result.filter(row => {
          const val = row[field];
          return val !== undefined && val !== null && String(val).toLowerCase().includes(filterVal);
        });
      }
    });

    // 3. Multi-type Sorting
    if (this.sortColumn) {
      const col = this.sortColumn;
      const dir = this.sortDirection === 'asc' ? 1 : -1;

      result.sort((a, b) => {
        const valA = a[col];
        const valB = b[col];

        if (valA === valB) return 0;
        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;

        if (typeof valA === 'number' && typeof valB === 'number') {
          return (valA - valB) * dir;
        }

        return String(valA).localeCompare(String(valB)) * dir;
      });
    }

    this.filteredData = result;
    this.totalPages = Math.ceil(this.filteredData.length / this.pageSize) || 1;
    this.updatePaginatedData();
  }

  private updatePaginatedData(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedData = this.filteredData.slice(start, end);
  }

  get startRecordIndex(): number {
    return this.filteredData.length === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  get endRecordIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredData.length);
  }
}
