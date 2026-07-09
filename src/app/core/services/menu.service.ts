// menu.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  base_price: string;
  image_url: string;
  is_vegetarian: boolean;
  is_gluten_free: boolean;
  is_spicy: boolean;
  is_available: boolean;
}

export interface MenuCategory {
  id: string;
  name: string;
  display_order: number;
  items: MenuItem[];
}

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getFullMenu() {
    return this.http.get<{ categories: MenuCategory[] }>(`${this.apiUrl}/menu`);
  }

  getMenuItemById(id: string) {
    return this.http.get<{ item: any }>(`${this.apiUrl}/menu/items/${id}`);
  }
}