import { Component, EventEmitter, Input, Output } from '@angular/core';
import { buildFileUrl } from '../../utils/file-url';

@Component({
  selector: 'app-photo-upload',
  standalone: false,
  templateUrl: './photo-upload.html',
  styleUrl: './photo-upload.scss',
})
export class PhotoUpload {
  @Input() existingPhotoUrl: string = '';
  @Output() fileSelected = new EventEmitter<File | undefined>();
  previewUrl: string | ArrayBuffer | null = null;

  onFileChange(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    const file = target?.files?.[0];

    if (file) {
      this.fileSelected.emit(file);
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removePhoto(): void {
    this.previewUrl = null;
    this.fileSelected.emit(undefined);
  }

  getExistingPhotoUrl(): string {
    return buildFileUrl(this.existingPhotoUrl) || 'assets/dummy-user.png';
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement | null;
    if (!img || img.src.endsWith('/assets/dummy-user.png')) {
      return;
    }
    img.src = 'assets/dummy-user.png';
  }
}
