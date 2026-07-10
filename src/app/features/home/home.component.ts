import { Component, inject, OnInit, signal, computed, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../layout/navbar/navbar.component';
import { MenuService, MenuCategory, MenuItem } from '../../core/services/menu.service';
import { CartService } from '../../core/services/cart.service';
import { debounceTime, Subject } from 'rxjs';
import { MasonryItemDirective } from './masonry-item.directive';

export interface BrandChef {
  name: string;
  title: string;
  paragraphs: string[];
  mainImage: string;
  backgroundImage: string;
  signatureImage: string;
}
export interface ContactLocation {
  address: string;
  xPercent: number;
  yPercent: number;
}

export interface ContactInfo {
  phone: string;
  email: string;
  workingHoursLines: string[];
  locations: ContactLocation[];
  mapImage: string;
}


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NavbarComponent, MasonryItemDirective],
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

  brandChef = signal<BrandChef>({
    name: 'Polyansky Maxim',
    title: 'Brand - Chef of Mamma Mia Restaurant',
    paragraphs: [
      'Maxim is a real professional, dedicated to his work. Despite his high and recognized skill, he constantly improves his skills, discovering new unique facets of flavors in seemingly familiar dishes. Regular internships allow Maxim to discover all the new secrets of cooking Italian cuisine.',
      'Since 2012, he has become the brand chef of three restaurants: La Province, La Prima, La Panorama, since 2013, the brand chef of the Gourmet-Alliance. Regular internships in restaurants and hotels in Piedmont, Tuscany and Sicily allow you to discover more and more secrets of cooking Italian cuisine.'
    ],
    mainImage: './chef-main.jpg',
    backgroundImage: './chef-restaurant.jpg',
    signatureImage: './chef-signature.png'
  });

  contactInfo = signal<ContactInfo>({
    phone: '7 (912) 32 43 546',
    email: 'info@mammamia.ru',
    workingHoursLines: [
      'The restaurant is open from 10:00 to 23:00',
      'Online orders are accepted around the clock'
    ],
    locations: [
      { address: 'st. Vosstaniya, 19, Saint Petersburg', xPercent: 52, yPercent: 62 },
      { address: 'st. Zhukovskogo, 35, St. Petersburg', xPercent: 42, yPercent: 74 }
    ],
    mapImage: './map-dark.png'
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

  categoryCards = computed(() => {
    return this.categories().map(cat => ({
      id: cat.id,
      name: cat.name,
      description: cat.items[0]?.description || `Explore our ${cat.name.toLowerCase()} selection.`,
      image: cat.items[0]?.image_url || '',
      firstItem: cat.items[0]
    }));
  });

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
    const scrollPos = window.scrollY;
    this.activeCategory.set(id);

    requestAnimationFrame(() => {
      window.scrollTo({ top: scrollPos });
    });
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

  goToChefPage() {
    this.router.navigate(['/chef']);
  }

  private readonly popularItemsLimit = 11;

  filteredPopularItems = computed(() => {
    const allItems = this.activeCategory() === 'all'
      ? this.allItemsFlat()
      : (this.categories().find(c => c.id === this.activeCategory())?.items ?? []);
    return allItems.slice(0, this.popularItemsLimit);
  });

  hasMorePopularItems = computed(() => false);

  showMorePopular() {}
}