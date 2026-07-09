// reviews.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ReviewsService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = environment.apiUrl;

  createReview(orderId: string, rating: number, comment?: string) {
    return this.http.post<{ message: string; review: any }>(
      `${this.apiUrl}/reviews`,
      { orderId, rating, comment },
      this.authService.getAuthHeaders()
    );
  }

  getReviewByOrder(orderId: string) {
    return this.http.get<{ review: any }>(
      `${this.apiUrl}/reviews/order/${orderId}`,
      this.authService.getAuthHeaders()
    );
  }
}