import { Component, inject, OnInit, signal, computed, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../layout/navbar/navbar.component';
import { MenuService, MenuCategory, MenuItem } from '../../core/services/menu.service';
import { CartService } from '../../core/services/cart.service';
import { debounceTime, Subject } from 'rxjs';

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
  private router = inject(Router);

  categories = signal<MenuCategory[]>([]);
  isLoading = signal(true);
  errorMessage = signal('');
  activeCategory = signal<string>('all');

  private searchSubject = new Subject<string>();
  isSearching = signal(false);

  heroParallaxOffset = signal(0);

  @HostListener('window:scroll')
  onScroll() {
    // Hero şəklinə yüngül parallax effekti - videodakı scroll hərəkətinə bənzər
    this.heroParallaxOffset.set(window.scrollY * 0.15);
  }

  allItemsFlat = computed<MenuItem[]>(() => this.categories().flatMap(cat => cat.items));

  popularItems = computed(() => {
    if (this.activeCategory() === 'all') {
      return this.allItemsFlat().slice(0, 6);
    }
    const cat = this.categories().find(c => c.id === this.activeCategory());
    return cat ? cat.items.slice(0, 6) : [];
  });

  ngOnInit() {
    this.loadFullMenu();

    this.searchSubject.pipe(debounceTime(400)).subscribe(query => {
      if (query.trim().length === 0) {
        this.isSearching.set(false);
        this.loadFullMenu();
      } else {
        this.isSearching.set(true);
        this.menuService.searchItems(query).subscribe({
          next: (response) => this.categories.set(response.categories),
          error: () => this.errorMessage.set('Axtarış zamanı xəta baş verdi.')
        });
      }
    });
  }

  onSearch(query: string) {
    this.searchSubject.next(query);
  }

  loadFullMenu() {
    this.isLoading.set(true);
    this.menuService.getFullMenu().subscribe({
      next: (response) => {
        this.categories.set(response.categories);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Menyu yüklənərkən xəta baş verdi.');
        this.isLoading.set(false);
      }
    });
  }

  setActiveCategory(id: string) {
    this.activeCategory.set(id);
  }

  goToDish(item: MenuItem) {
    this.router.navigate(['/dish', item.id]);
  }

  quickAddToCart(event: Event, item: MenuItem) {
    event.stopPropagation();
    this.cartService.addItem({
      menuItemId: item.id,
      name: item.name,
      unitPrice: parseFloat(item.base_price),
      imageUrl: item.image_url
    });
  }

  scrollToMenu() {
    document.getElementById('menu-section')?.scrollIntoView({ behavior: 'smooth' });
  }
}