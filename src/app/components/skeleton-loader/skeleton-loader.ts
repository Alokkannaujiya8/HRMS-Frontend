import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-skeleton-loader',
  standalone: false,
  templateUrl: './skeleton-loader.html',
  styleUrl: './skeleton-loader.scss',
})
export class SkeletonLoaderComponent {
  @Input() type: 'card' | 'table' | 'profile' | 'chart' | 'list' = 'card';
  @Input() count = 3;
  @Input() progress = 0; // 0 to 100
  @Input() showProgressBar = false;

  get countArray(): number[] {
    return Array(this.count).fill(0);
  }
}
