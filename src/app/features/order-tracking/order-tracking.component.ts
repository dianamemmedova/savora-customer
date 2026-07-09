import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { NavbarComponent } from '../../layout/navbar/navbar.component';
import { OrdersService } from '../../core/services/orders.service';

interface OrderStep {
  status: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [NavbarComponent, RouterLink, TitleCasePipe],
  templateUrl: './order-tracking.component.html',
  styleUrl: './order-tracking.component.css'
})
export class OrderTrackingComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private ordersService = inject(OrdersService);

  order = signal<any>(null);
  isLoading = signal(true);
  errorMessage = signal('');

  private pollingInterval: any;

  steps: OrderStep[] = [
    { status: 'placed', label: 'Order Placed', icon: 'fa-receipt' },
    { status: 'confirmed', label: 'Confirmed', icon: 'fa-check' },
    { status: 'preparing', label: 'Preparing', icon: 'fa-fire' },
    { status: 'ready', label: 'Ready', icon: 'fa-bell' },
    { status: 'completed', label: 'Completed', icon: 'fa-circle-check' }
  ];

  ngOnInit() {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (!orderId) return;

    this.fetchOrder(orderId);

    // Hər 5 saniyədə bir statusu yenidən yoxla ("polling" - sadə real-vaxt simulyasiyası)
    this.pollingInterval = setInterval(() => {
      this.fetchOrder(orderId);
    }, 5000);
  }

  ngOnDestroy() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }

  fetchOrder(orderId: string) {
    this.ordersService.getOrderById(orderId).subscribe({
      next: (response) => {
        this.order.set(response.order);
        this.isLoading.set(false);

        // Sifariş tamamlanıb ya da ləğv edilibsə, polling-i dayandır
        if (['completed', 'cancelled'].includes(response.order.status)) {
          clearInterval(this.pollingInterval);
        }
      },
      error: (err) => {
        this.errorMessage.set('Sifariş yüklənərkən xəta baş verdi.');
        this.isLoading.set(false);
        clearInterval(this.pollingInterval);
      }
    });
  }

  isStepActive(stepStatus: string): boolean {
    if (!this.order()) return false;
    const currentIndex = this.steps.findIndex(s => s.status === this.order().status);
    const stepIndex = this.steps.findIndex(s => s.status === stepStatus);
    return stepIndex <= currentIndex;
  }

  isStepCurrent(stepStatus: string): boolean {
    return this.order()?.status === stepStatus;
  }
}