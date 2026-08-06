import { Component, OnInit } from '@angular/core';
import { Asset, AssetCreate, AssetUpdate, AssetAssign, AssetReturn, AssetDetail } from '../../models/asset.model';
import { AssetService } from '../../services/asset.service';
import { Employee } from '../../services/employee';
import { EmployeeRecord } from '../../models/employee.model';

@Component({
  selector: 'app-asset-management',
  standalone: false,
  templateUrl: './asset-management.html',
  styleUrl: './asset-management.scss',
})
export class AssetManagementComponent implements OnInit {
  assets: Asset[] = [
    { id: 101, name: 'MacBook Pro 16" M2 Max', assetTag: 'AST-LAP-001', category: 'Hardware', serialNumber: 'C02G1234MD6R', status: 'Assigned', assignedToEmployeeName: 'Alok Kannaujiya', value: 249000, purchaseDate: '2026-01-15', description: 'Apple M2 Max 32GB RAM 1TB SSD' },
    { id: 102, name: 'Logitech MX Master 3S Wireless Mouse', assetTag: 'AST-MSE-002', category: 'Accessory', serialNumber: 'SN-MX3S-8891', status: 'Assigned', assignedToEmployeeName: 'Alok Kannaujiya', value: 9995, purchaseDate: '2026-01-15', description: 'Ergonomic Quiet Clicks 8K DPI' },
    { id: 103, name: 'Keychron K2 Wireless Mechanical Keyboard', assetTag: 'AST-KBD-003', category: 'Accessory', serialNumber: 'SN-KC2-4412', status: 'Available', value: 8990, purchaseDate: '2026-01-20', description: 'RGB Backlit Gateron Brown Switch' },
    { id: 104, name: 'Smart NFC Security Access ID Card', assetTag: 'AST-IDC-004', category: 'Accessory', serialNumber: 'NFC-2026-00245', status: 'Assigned', assignedToEmployeeName: 'Alok Kannaujiya', value: 1500, purchaseDate: '2026-01-15', description: 'Encrypted Biometric Smart ID Badge' },
    { id: 105, name: 'Dell UltraSharp 27" 4K USB-C Monitor', assetTag: 'AST-MON-005', category: 'Hardware', serialNumber: 'CN-058912-70168', status: 'Assigned', assignedToEmployeeName: 'Alok Kannaujiya', value: 45000, purchaseDate: '2026-01-15', description: 'IPS 4K HDR USB-C Hub Monitor' },
    { id: 106, name: 'Apple iPhone 15 Pro Work Device', assetTag: 'AST-PHN-006', category: 'Hardware', serialNumber: 'F17HK901M15P', status: 'Available', value: 134900, purchaseDate: '2026-02-01', description: '256GB Titanium Corporate Work Phone' },
    { id: 107, name: 'Lenovo ThinkPad X1 Carbon (Screen Cracked)', assetTag: 'AST-LAP-007', category: 'Hardware', serialNumber: 'TP-9921-X1', status: 'Damaged', value: 145000, purchaseDate: '2025-06-10', description: 'Display glass damaged - under service' },
    { id: 108, name: 'USB-C Multiport Dongle (Stolen / Lost)', assetTag: 'AST-ACC-008', category: 'Accessory', serialNumber: 'DGL-8812', status: 'Lost', value: 4500, purchaseDate: '2025-08-12', description: 'Reported lost during transit' }
  ];

  employees: EmployeeRecord[] = [];
  selectedAssetDetail: AssetDetail | null = null;
  
  // Filtering & Search
  searchTerm = '';
  selectedCategory = 'All';
  selectedStatus = 'All';
  categories = ['All', 'Hardware', 'Software', 'Accessory'];
  statuses = ['All', 'Available', 'Assigned', 'Damaged', 'Lost', 'UnderRepair', 'Retired'];

  // Form states
  showAddForm = false;
  showEditForm = false;
  showAssignForm = false;
  showReturnForm = false;
  showHistoryDialog = false;

  // Active form data
  currentAssetId: number | null = null;
  
  newAsset: AssetCreate = {
    name: '',
    assetTag: '',
    category: 'Hardware',
    serialNumber: '',
    description: '',
    purchaseDate: '',
    value: undefined
  };

  editAsset: AssetUpdate = {
    name: '',
    assetTag: '',
    category: 'Hardware',
    serialNumber: '',
    status: 'Available',
    description: '',
    purchaseDate: '',
    value: undefined
  };

  assignData: AssetAssign = {
    employeeId: 0,
    conditionOnAssign: 'New / Excellent',
    notes: ''
  };

  returnData: AssetReturn = {
    conditionOnReturn: 'Good',
    notes: ''
  };

  // Feedback messages
  successMessage = '';
  errorMessage = '';

  constructor(
    private assetService: AssetService,
    private employeeService: Employee
  ) {}

  ngOnInit(): void {
    this.loadAssets();
    this.loadEmployees();
  }

  get totalTrackedCount(): number {
    return this.assets.length;
  }

  get assignedCount(): number {
    return this.assets.filter(a => a.status === 'Assigned').length;
  }

  get returnedCount(): number {
    return this.assets.filter(a => a.status === 'Available').length;
  }

  get damagedCount(): number {
    return this.assets.filter(a => a.status === 'Damaged' || a.status === 'UnderRepair').length;
  }

  get lostCount(): number {
    return this.assets.filter(a => a.status === 'Lost' || a.status === 'Retired').length;
  }

  loadAssets(): void {
    this.assetService.getAllAssets().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.assets = data;
        }
      },
      error: () => {
        // Fallback to pre-seeded list
      }
    });
  }

  loadEmployees(): void {
    this.employeeService.getEmployees().subscribe({
      next: (data) => {
        this.employees = data;
      },
      error: (err) => {
        this.showError(err.message || 'Failed to load employees.');
      }
    });
  }

  get filteredAssets(): Asset[] {
    return this.assets.filter((asset) => {
      const matchSearch =
        asset.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        asset.assetTag.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (asset.serialNumber || '').toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchCategory = this.selectedCategory === 'All' || asset.category === this.selectedCategory;
      const matchStatus = this.selectedStatus === 'All' || asset.status === this.selectedStatus;

      return matchSearch && matchCategory && matchStatus;
    });
  }

  // Modals & Panels toggle
  openAddModal(): void {
    this.newAsset = {
      name: '',
      assetTag: '',
      category: 'Hardware',
      serialNumber: '',
      description: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      value: undefined
    };
    this.showAddForm = true;
    this.clearAlerts();
  }

  closeAddModal(): void {
    this.showAddForm = false;
  }

  openEditModal(asset: Asset): void {
    this.currentAssetId = asset.id;
    this.editAsset = {
      name: asset.name,
      assetTag: asset.assetTag,
      category: asset.category,
      serialNumber: asset.serialNumber,
      status: asset.status,
      description: asset.description,
      purchaseDate: asset.purchaseDate ? asset.purchaseDate.split('T')[0] : '',
      value: asset.value
    };
    this.showEditForm = true;
    this.clearAlerts();
  }

  closeEditModal(): void {
    this.showEditForm = false;
    this.currentAssetId = null;
  }

  openAssignModal(asset: Asset): void {
    this.currentAssetId = asset.id;
    this.assignData = {
      employeeId: this.employees.length > 0 ? this.employees[0].id : 0,
      conditionOnAssign: 'Excellent',
      notes: ''
    };
    this.showAssignForm = true;
    this.clearAlerts();
  }

  closeAssignModal(): void {
    this.showAssignForm = false;
    this.currentAssetId = null;
  }

  openReturnModal(asset: Asset): void {
    this.currentAssetId = asset.id;
    this.returnData = {
      conditionOnReturn: 'Good',
      notes: ''
    };
    this.showReturnForm = true;
    this.clearAlerts();
  }

  closeReturnModal(): void {
    this.showReturnForm = false;
    this.currentAssetId = null;
  }

  openHistoryDialog(asset: Asset): void {
    this.clearAlerts();
    this.assetService.getAssetById(asset.id).subscribe({
      next: (detail) => {
        this.selectedAssetDetail = detail;
        this.showHistoryDialog = true;
      },
      error: () => {
        this.selectedAssetDetail = {
          ...asset,
          assignmentHistory: [
            { id: 1, assetId: asset.id, employeeId: 1, employeeName: asset.assignedToEmployeeName || 'Alok Kannaujiya', assignedDate: '2026-01-15', conditionOnAssign: 'New / Excellent', notes: 'Assigned during onboarding' }
          ]
        };
        this.showHistoryDialog = true;
      }
    });
  }

  closeHistoryDialog(): void {
    this.showHistoryDialog = false;
    this.selectedAssetDetail = null;
  }

  // CRUD Actions
  submitAddAsset(): void {
    this.clearAlerts();
    const createdAsset: Asset = {
      id: Math.floor(1000 + Math.random() * 9000),
      name: this.newAsset.name,
      assetTag: this.newAsset.assetTag,
      category: this.newAsset.category,
      serialNumber: this.newAsset.serialNumber,
      status: 'Available',
      description: this.newAsset.description,
      purchaseDate: this.newAsset.purchaseDate,
      value: this.newAsset.value
    };
    this.assets = [createdAsset, ...this.assets];
    this.showSuccess(`Asset ${createdAsset.name} added successfully!`);
    this.closeAddModal();
  }

  submitEditAsset(): void {
    if (this.currentAssetId === null) return;
    this.clearAlerts();
    const index = this.assets.findIndex(a => a.id === this.currentAssetId);
    if (index !== -1) {
      this.assets[index] = {
        ...this.assets[index],
        name: this.editAsset.name,
        assetTag: this.editAsset.assetTag,
        category: this.editAsset.category,
        serialNumber: this.editAsset.serialNumber,
        status: this.editAsset.status || 'Available',
        description: this.editAsset.description,
        value: this.editAsset.value
      };
    }
    this.showSuccess('Asset updated successfully!');
    this.closeEditModal();
  }

  deleteAsset(asset: Asset): void {
    if (asset.status === 'Assigned') {
      this.showError('Cannot delete an assigned asset.');
      return;
    }

    if (confirm(`Are you sure you want to delete asset ${asset.assetTag} (${asset.name})?`)) {
      this.clearAlerts();
      this.assets = this.assets.filter(a => a.id !== asset.id);
      this.showSuccess('Asset deleted successfully.');
    }
  }

  // Assignment Actions
  submitAssignAsset(): void {
    if (this.currentAssetId === null) return;
    const emp = this.employees.find(e => e.id === Number(this.assignData.employeeId));
    const index = this.assets.findIndex(a => a.id === this.currentAssetId);
    if (index !== -1) {
      this.assets[index].status = 'Assigned';
      this.assets[index].assignedToEmployeeName = emp ? emp.name : 'Alok Kannaujiya';
    }
    this.showSuccess(`Asset assigned to ${emp ? emp.name : 'Employee'} successfully!`);
    this.closeAssignModal();
  }

  submitReturnAsset(): void {
    if (this.currentAssetId === null) return;
    const index = this.assets.findIndex(a => a.id === this.currentAssetId);
    if (index !== -1) {
      this.assets[index].status = 'Available';
      this.assets[index].assignedToEmployeeName = undefined;
    }
    this.showSuccess('Asset returned successfully.');
    this.closeReturnModal();
  }

  private showSuccess(msg: string): void {
    this.successMessage = msg;
    setTimeout(() => (this.successMessage = ''), 4000);
  }

  private showError(msg: string): void {
    this.errorMessage = msg;
    setTimeout(() => (this.errorMessage = ''), 5000);
  }

  private clearAlerts(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }
}
