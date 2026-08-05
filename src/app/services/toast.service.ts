import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<ToastMessage[]>([]);
  toasts$ = this.toastsSubject.asObservable();

  showSuccess(message: string, title = 'Success'): void {
    this.addToast('success', title, message);
  }

  showError(message: string, title = 'Error'): void {
    this.addToast('error', title, message);
  }

  showInfo(message: string, title = 'Notification'): void {
    this.addToast('info', title, message);
  }

  showWarning(message: string, title = 'Warning'): void {
    this.addToast('warning', title, message);
  }

  dismiss(id: string): void {
    const current = this.toastsSubject.value.filter(t => t.id !== id);
    this.toastsSubject.next(current);
  }

  private addToast(type: 'success' | 'error' | 'info' | 'warning', title: string, message: string, duration = 4000): void {
    const id = Math.random().toString(36).substring(2, 9);
    const toast: ToastMessage = { id, type, title, message, duration };

    const current = this.toastsSubject.value;
    this.toastsSubject.next([...current, toast]);

    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, duration);
    }
  }
}
