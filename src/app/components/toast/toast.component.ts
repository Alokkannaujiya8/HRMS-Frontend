import { Component, OnInit } from '@angular/core';
import { ToastService, ToastMessage } from '../../services/toast.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-toast-container',
  standalone: false,
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
})
export class ToastContainerComponent implements OnInit {
  toasts$!: Observable<ToastMessage[]>;

  constructor(public toastService: ToastService) { }

  ngOnInit(): void {
    this.toasts$ = this.toastService.toasts$;
  }

  dismiss(id: string): void {
    this.toastService.dismiss(id);
  }
}
