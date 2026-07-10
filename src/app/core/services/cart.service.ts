import { Injectable, signal, computed, inject } from '@angular/core';
import { ToastService } from '../../core/services/toast.service';

export interface CartItem {
  menuItemId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  imageUrl: string;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private toastService = inject(ToastService);

  items = signal<CartItem[]>([]);

  totalItems = computed(() => this.items().reduce((sum, item) => sum + item.quantity, 0));
  subtotal = computed(() => this.items().reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0));

  addItem(item: Omit<CartItem, 'quantity'>, quantity: number = 1) {
    const existing = this.items().find(i => i.menuItemId === item.menuItemId);

    if (existing) {
      this.items.update(items =>
        items.map(i => i.menuItemId === item.menuItemId ? { ...i, quantity: i.quantity + quantity } : i)
      );
    } else {
      this.items.update(items => [...items, { ...item, quantity }]);
    }

    this.toastService.show(`${item.name} səbətə əlavə olundu`, 'fa-solid fa-cart-shopping');
  }

  removeItem(menuItemId: string) {
    this.items.update(items => items.filter(i => i.menuItemId !== menuItemId));
  }

  updateQuantity(menuItemId: string, quantity: number) {
    if (quantity <= 0) {
      this.removeItem(menuItemId);
      return;
    }
    this.items.update(items =>
      items.map(i => i.menuItemId === menuItemId ? { ...i, quantity } : i)
    );
  }

  clearCart() {
    this.items.set([]);
  }
}