// home.component.ts
import { Component, inject, OnInit, signal } from '@angular/core';
import { NavbarComponent } from '../../layout/navbar/navbar.component';
import { MenuService, MenuCategory, MenuItem } from '../../core/services/menu.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NavbarComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  private menuService = inject(MenuService);
  private cartService = inject(CartService);

  categories = signal<MenuCategory[]>([]);
  isLoading = signal(true);
  errorMessage = signal('');

  ngOnInit() {
    this.menuService.getFullMenu().subscribe({
      next: (response) => {
        this.categories.set(response.categories);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.errorMessage.set('Menyu yüklənərkən xəta baş verdi.');
        this.isLoading.set(false);
      }
    });
  }

  addToCart(item: MenuItem) {
    this.cartService.addItem({
      menuItemId: item.id,
      name: item.name,
      unitPrice: parseFloat(item.base_price),
      imageUrl: item.image_url
    });
  }
}