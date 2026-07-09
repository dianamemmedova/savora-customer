// orders.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface CreateOrderPayload {
  restaurantId: string;
  orderType: 'dine_in' | 'takeaway' | 'delivery';
  tableId?: string;
  deliveryAddress?: string;
  tipAmount?: number;
  specialInstructions?: string;
  items: {
    menuItemId: string;
    quantity: number;
    notes?: string;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = environment.apiUrl;

  createOrder(payload: CreateOrderPayload) {
    return this.http.post<{ message: string; order: any }>(
      `${this.apiUrl}/orders`,
      payload,
      this.authService.getAuthHeaders()
    );
  }

  getMyOrders() {
    return this.http.get<{ orders: any[] }>(
      `${this.apiUrl}/orders/my`,
      this.authService.getAuthHeaders()
    );
  }

  getOrderById(id: string) {
    return this.http.get<{ order: any }>(
      `${this.apiUrl}/orders/${id}`,
      this.authService.getAuthHeaders()
    );
  }
}