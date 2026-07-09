export interface Asset {
  id: number;
  name: string;
  assetTag: string;
  category: string;
  serialNumber?: string;
  status: string; // Available, Assigned, UnderRepair, Retired
  description?: string;
  purchaseDate?: string;
  value?: number;
  assignedToEmployeeId?: number;
  assignedToEmployeeName?: string;
  assignedDate?: string;
}

export interface AssetAssignment {
  id: number;
  assetId: number;
  assetName?: string;
  assetTag?: string;
  employeeId: number;
  employeeName?: string;
  assignedDate: string;
  returnedDate?: string;
  conditionOnAssign?: string;
  conditionOnReturn?: string;
  notes?: string;
}

export interface AssetDetail extends Asset {
  assignmentHistory: AssetAssignment[];
}

export interface AssetCreate {
  name: string;
  assetTag: string;
  category: string;
  serialNumber?: string;
  description?: string;
  purchaseDate?: string;
  value?: number;
}

export interface AssetUpdate {
  name: string;
  assetTag: string;
  category: string;
  serialNumber?: string;
  status?: string;
  description?: string;
  purchaseDate?: string;
  value?: number;
}

export interface AssetAssign {
  employeeId: number;
  conditionOnAssign?: string;
  notes?: string;
}

export interface AssetReturn {
  conditionOnReturn?: string;
  notes?: string;
}
