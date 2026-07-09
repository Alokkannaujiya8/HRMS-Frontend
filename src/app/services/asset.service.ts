import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Asset, AssetCreate, AssetUpdate, AssetAssign, AssetReturn, AssetDetail, AssetAssignment } from '../models/asset.model';

@Injectable({
  providedIn: 'root',
})
export class AssetService {
  private readonly apiUrl = 'https://localhost:7147/api/assets';

  constructor(private http: HttpClient) {}

  getAllAssets(): Observable<Asset[]> {
    return this.http.get<Asset[]>(this.apiUrl);
  }

  getAssetById(id: number): Observable<AssetDetail> {
    return this.http.get<AssetDetail>(`${this.apiUrl}/${id}`);
  }

  createAsset(asset: AssetCreate): Observable<Asset> {
    return this.http.post<Asset>(this.apiUrl, asset);
  }

  updateAsset(id: number, asset: AssetUpdate): Observable<Asset> {
    return this.http.put<Asset>(`${this.apiUrl}/${id}`, asset);
  }

  deleteAsset(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  assignAsset(id: number, assignData: AssetAssign): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/${id}/assign`, assignData);
  }

  returnAsset(id: number, returnData: AssetReturn): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/${id}/return`, returnData);
  }

  getEmployeeAssets(employeeId: number): Observable<AssetAssignment[]> {
    return this.http.get<AssetAssignment[]>(`${this.apiUrl}/employee/${employeeId}`);
  }
}
