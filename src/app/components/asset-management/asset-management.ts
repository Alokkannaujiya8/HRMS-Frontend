import { Component, OnInit } from '@angular/core';
import { Asset, AssetCreate, AssetUpdate, AssetAssign, AssetReturn, AssetDetail, AssetAssignment } from '../../models/asset.model';
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
  assets: Asset[] = [];
  employees: EmployeeRecord[] = [];
  selectedAssetDetail: AssetDetail | null = null;
  
  // Filtering & Search
  searchTerm = '';
  selectedCategory = 'All';
  selectedStatus = 'All';
  categories = ['All', 'Hardware', 'Software', 'Accessory'];
  statuses = ['All', 'Available', 'Assigned', 'UnderRepair', 'Retired'];

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

  loadAssets(): void {
    this.assetService.getAllAssets().subscribe({
      next: (data) => {
        this.assets = data;
      },
      error: (err) => {
        this.showError(err.message || 'Failed to load assets.');
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
      error: (err) => {
        this.showError(err.message || 'Failed to fetch asset history.');
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
    this.assetService.createAsset(this.newAsset).subscribe({
      next: () => {
        this.showSuccess('Asset added successfully!');
        this.closeAddModal();
        this.loadAssets();
      },
      error: (err) => {
        this.showError(err.message || 'Failed to create asset.');
      }
    });
  }

  submitEditAsset(): void {
    if (this.currentAssetId === null) return;
    this.clearAlerts();
    this.assetService.updateAsset(this.currentAssetId, this.editAsset).subscribe({
      next: () => {
        this.showSuccess('Asset updated successfully!');
        this.closeEditModal();
        this.loadAssets();
      },
      error: (err) => {
        this.showError(err.message || 'Failed to update asset.');
      }
    });
  }

  deleteAsset(asset: Asset): void {
    if (asset.status === 'Assigned') {
      this.showError('Cannot delete an assigned asset.');
      return;
    }

    if (confirm(`Are you sure you want to delete asset ${asset.assetTag} (${asset.name})?`)) {
      this.clearAlerts();
      this.assetService.deleteAsset(asset.id).subscribe({
        next: () => {
          this.showSuccess('Asset deleted successfully.');
          this.loadAssets();
        },
        error: (err) => {
          this.showError(err.message || 'Failed to delete asset.');
        }
      });
    }
  }

  // Assignment Actions
  submitAssignAsset(): void {
    if (this.currentAssetId === null) return;
    if (!this.assignData.employeeId) {
      this.showError('Please select an employee.');
      return;
    }

    this.clearAlerts();
    this.assetService.assignAsset(this.currentAssetId, this.assignData).subscribe({
      next: () => {
        this.showSuccess('Asset assigned successfully!');
        this.closeAssignModal();
        this.loadAssets();
      },
      error: (err) => {
        this.showError(err.message || 'Failed to assign asset.');
      }
    });
  }

  submitReturnAsset(): void {
    if (this.currentAssetId === null) return;
    this.clearAlerts();
    this.assetService.returnAsset(this.currentAssetId, this.returnData).subscribe({
      next: () => {
        this.showSuccess('Asset returned successfully.');
        this.closeReturnModal();
        this.loadAssets();
      },
      error: (err) => {
        this.showError(err.message || 'Failed to return asset.');
      }
    });
  }

  // Helpers
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
