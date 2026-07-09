// cart.component.ts
import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../layout/navbar/navbar.component';
import { CartService } from '../../core/services/cart.service';
import { OrdersService } from '../../core/services/orders.service';

const RESTAURANT_ID = 'e46573f2-ace7-4946-852f-d0ce35060a35'; // Sənin test restoranın ID-si

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [NavbarComponent, FormsModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent {
  cartService = inject(CartService);
  private ordersService = inject(OrdersService);
  private router = inject(Router);

  orderType = signal<'dine_in' | 'takeaway' | 'delivery'>('takeaway');
  tableNumber = signal('');
  deliveryAddress = signal('');
  tipPercent = signal(10);
  specialInstructions = signal('');

  isPlacingOrder = signal(false);
  errorMessage = signal('');

  tipAmount = computed(() => {
    return Math.round(this.cartService.subtotal() * (this.tipPercent() / 100) * 100) / 100;
  });

  estimatedTotal = computed(() => {
    // Bu, yalnız TƏXMİNİ göstərici üçündür - əsl hesablama backend-də edilir
    return this.cartService.subtotal() + this.tipAmount();
  });

  setOrderType(type: 'dine_in' | 'takeaway' | 'delivery') {
    this.orderType.set(type);
  }

  setTip(percent: number) {
    this.tipPercent.set(percent);
  }

  placeOrder() {
    if (this.cartService.items().length === 0) {
      this.errorMessage.set('Səbətiniz boşdur.');
      return;
    }

    if (this.orderType() === 'delivery' && !this.deliveryAddress()) {
      this.errorMessage.set('Çatdırılma üçün ünvan daxil edin.');
      return;
    }

    this.isPlacingOrder.set(true);
    this.errorMessage.set('');

    const payload = {
      restaurantId: RESTAURANT_ID,
      orderType: this.orderType(),
      deliveryAddress: this.orderType() === 'delivery' ? this.deliveryAddress() : undefined,
      tipAmount: this.tipAmount(),
      specialInstructions: this.specialInstructions() || undefined,
      items: this.cartService.items().map(item => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        notes: item.notes
      }))
    };

    this.ordersService.createOrder(payload).subscribe({
      next: (response) => {
        this.isPlacingOrder.set(false);
        this.cartService.clearCart();
        this.router.navigate(['/order-tracking', response.order.id]);
      },
      error: (err) => {
        this.isPlacingOrder.set(false);
        this.errorMessage.set(err.error?.error || 'Sifariş yaradılarkən xəta baş verdi.');
      }
    });
  }
}