// profile.component.ts
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../layout/navbar/navbar.component';
import { AuthService } from '../../core/services/auth.service';
import { OrdersService } from '../../core/services/orders.service';
import { ReviewsService } from '../../core/services/reviews.service';

interface OrderSummary {
  id: string;
  order_number: number;
  order_type: string;
  status: string;
  total_amount: string;
  placed_at: string;
  hasReview?: boolean;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [NavbarComponent, RouterLink, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  authService = inject(AuthService);
  private ordersService = inject(OrdersService);
  private reviewsService = inject(ReviewsService);

  activeTab = signal<'active' | 'past'>('active');
  orders = signal<OrderSummary[]>([]);
  isLoading = signal(true);

  // Rəy yazma modalı üçün
  reviewingOrderId = signal<string | null>(null);
  selectedRating = signal(0);
  reviewComment = signal('');
  isSubmittingReview = signal(false);
  reviewSuccessMessage = signal('');

  activeOrders = signal<OrderSummary[]>([]);
  pastOrders = signal<OrderSummary[]>([]);

  setTab(tab: 'active' | 'past') {
    this.activeTab.set(tab);
  }

  ngOnInit() {
    this.ordersService.getMyOrders().subscribe({
      next: (response) => {
        const allOrders = response.orders;
        this.activeOrders.set(
          allOrders.filter((o: OrderSummary) => !['completed', 'cancelled'].includes(o.status))
        );
        this.pastOrders.set(
          allOrders.filter((o: OrderSummary) => ['completed', 'cancelled'].includes(o.status))
        );
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  openReviewForm(orderId: string) {
    this.reviewingOrderId.set(orderId);
    this.selectedRating.set(0);
    this.reviewComment.set('');
    this.reviewSuccessMessage.set('');
  }

  closeReviewForm() {
    this.reviewingOrderId.set(null);
  }

  selectRating(rating: number) {
    this.selectedRating.set(rating);
  }

  submitReview() {
    if (this.selectedRating() === 0 || !this.reviewingOrderId()) return;

    this.isSubmittingReview.set(true);

    this.reviewsService.createReview(
      this.reviewingOrderId()!,
      this.selectedRating(),
      this.reviewComment() || undefined
    ).subscribe({
      next: () => {
        this.isSubmittingReview.set(false);
        this.reviewSuccessMessage.set('Rəyiniz üçün təşəkkürlər!');
        setTimeout(() => this.closeReviewForm(), 1500);
      },
      error: (err) => {
        this.isSubmittingReview.set(false);
        this.reviewSuccessMessage.set(err.error?.error || 'Xəta baş verdi.');
      }
    });
  }

  logout() {
    this.authService.logout();
  }
}