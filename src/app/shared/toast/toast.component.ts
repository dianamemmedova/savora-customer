import { Component, inject } from '@angular/core';
import { ToastService } from '../../core/services/toast.service';

export interface Toast {
  id: number;
  message: string;
  icon: string;
}
@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.css'
})
export class ToastComponent {
  toastService = inject(ToastService);
}