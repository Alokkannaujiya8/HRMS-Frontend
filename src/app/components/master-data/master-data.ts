import { Component, OnInit } from '@angular/core';
import { MasterData } from '../../models/staff.model';
import { StaffData } from '../../services/staff-data';

@Component({
  selector: 'app-master-data',
  standalone: false,
  templateUrl: './master-data.html',
  styleUrl: './master-data.scss',
})
export class MasterDataComponent implements OnInit {
  master: MasterData = { divisions: [], designations: [] };
  newDivision = '';
  newDesignation = '';

  constructor(private staffData: StaffData) {}

  ngOnInit(): void {
    this.load();
  }

  addDivision(): void {
    this.staffData.addDivision(this.newDivision);
    this.newDivision = '';
    this.load();
  }

  addDesignation(): void {
    this.staffData.addDesignation(this.newDesignation);
    this.newDesignation = '';
    this.load();
  }

  removeDivision(value: string): void {
    this.staffData.deleteDivision(value);
    this.load();
  }

  removeDesignation(value: string): void {
    this.staffData.deleteDesignation(value);
    this.load();
  }

  private load(): void {
    this.master = this.staffData.getMasterData();
  }
}
