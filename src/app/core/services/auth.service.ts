// auth.service.ts
import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  loyaltyPoints: number;
}

interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = environment.apiUrl;

  currentUser = signal<User | null>(this.loadUserFromStorage());
  token = signal<string | null>(localStorage.getItem('savora_token'));
  isLoggedIn = computed(() => this.token() !== null);

  private loadUserFromStorage(): User | null {
    const stored = localStorage.getItem('savora_user');
    return stored ? JSON.parse(stored) : null;
  }

  register(fullName: string, email: string, password: string, phone?: string) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, {
      fullName, email, password, phone
    });
  }

  login(email: string, password: string) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, {
      email, password
    });
  }

  setSession(response: AuthResponse) {
    localStorage.setItem('savora_token', response.token);
    localStorage.setItem('savora_user', JSON.stringify(response.user));
    this.token.set(response.token);
    this.currentUser.set(response.user);
  }

  logout() {
    localStorage.removeItem('savora_token');
    localStorage.removeItem('savora_user');
    this.token.set(null);
    this.currentUser.set(null);
    this.router.navigate(['/home']);
  }

  getAuthHeaders() {
    return {
      headers: { Authorization: `Bearer ${this.token()}` }
    };
  }
}