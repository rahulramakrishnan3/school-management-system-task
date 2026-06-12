import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { Product, ProductStore, StorefrontQuery } from '../admin/products/product.store';
import { CartService } from './cart.service';
import { ProductCardComponent } from './product-card.component';

@Component({
  selector: 'app-catalogue',
  imports: [ProductCardComponent],
  templateUrl: './catalogue.page.html',
  styleUrl: './catalogue.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CataloguePage implements OnInit {
  // OnPush lets URL-derived signals and live stock patches update focused catalogue regions.
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly store = inject(ProductStore);
  protected readonly cart = inject(CartService);
  protected readonly selectedCategories = signal<readonly string[]>([]);
  protected readonly priceLimit = signal(this.store.maxPrice());
  protected readonly inStockOnly = signal(false);
  protected readonly page = signal(1);
  protected readonly pageSize = 6;
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  private readonly results = signal<readonly Product[]>([]);
  protected readonly pageCount = computed(() => Math.max(1, Math.ceil(this.results().length / this.pageSize)));
  protected readonly visibleProducts = computed(() =>
    this.results().slice((this.page() - 1) * this.pageSize, this.page() * this.pageSize),
  );

  constructor() {
    const params = this.route.snapshot.queryParamMap;
    this.selectedCategories.set(params.getAll('category'));
    this.priceLimit.set(Number(params.get('maxPrice')) || this.store.maxPrice());
    this.inStockOnly.set(params.get('inStock') === 'true');
    this.page.set(Number(params.get('page')) || 1);

    effect(() => {
      this.store.setVisibleIds(this.visibleProducts().map((product) => product.id));
    });
  }

  ngOnInit(): void {
    this.load();
    if ('PerformanceObserver' in globalThis) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) console.info(`[performance] ${entry.entryType}:`, entry);
      });
      observer.observe({ type: 'largest-contentful-paint', buffered: true });
      observer.observe({ type: 'layout-shift', buffered: true });
      this.destroyRef.onDestroy(() => observer.disconnect());
    }
  }

  protected toggleCategory(category: string): void {
    this.selectedCategories.update((items) =>
      items.includes(category) ? items.filter((item) => item !== category) : [...items, category],
    );
    this.page.set(1);
    this.syncAndLoad();
  }

  protected setPrice(value: string): void {
    this.priceLimit.set(Number(value));
    this.page.set(1);
    this.syncAndLoad();
  }

  protected toggleStock(): void {
    this.inStockOnly.update((value) => !value);
    this.page.set(1);
    this.syncAndLoad();
  }

  protected setPage(page: number): void {
    this.page.set(Math.max(1, Math.min(this.pageCount(), page)));
    this.syncUrl();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.store
      .fetchStorefront(this.query())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (products) => {
          this.results.set(products);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('The catalogue could not be loaded. Please try again.');
          this.loading.set(false);
        },
      });
  }

  private query(): StorefrontQuery {
    return {
      categories: this.selectedCategories(),
      maxPrice: this.priceLimit(),
      inStockOnly: this.inStockOnly(),
      page: this.page(),
    };
  }

  private syncAndLoad(): void {
    this.syncUrl();
    this.load();
  }

  private syncUrl(): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        category: this.selectedCategories(),
        maxPrice: this.priceLimit(),
        inStock: this.inStockOnly() || null,
        page: this.page() > 1 ? this.page() : null,
      },
    });
  }
}
