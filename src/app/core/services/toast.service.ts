import { Injectable, signal } from '@angular/core';


export interface Toast {
  id: number;
  message: string;
  icon: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts = signal<Toast[]>([]);
  private nextId = 0;

  show(message: string, icon: string = 'fa-solid fa-circle-check') {
    const id = this.nextId++;
    this.toasts.update(list => [...list, { id, message, icon }]);

    setTimeout(() => this.dismiss(id), 2600);
  }

  dismiss(id: number) {
    this.toasts.update(list => list.filter(toast => toast.id !== id));
  }
}