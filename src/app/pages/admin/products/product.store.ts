import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, Subject, catchError, delay, interval, map, of, switchMap, tap, throwError } from 'rxjs';

export interface Product {
  readonly id: string;
  readonly name: string;
  readonly category: string;
  readonly price: number;
  readonly stock: number;
}

export interface ProductQuery {
  readonly search: string;
  readonly category: string;
}

const PRODUCTS: readonly Product[] = [
  { id: 'p1', name: 'Interactive Whiteboard', category: 'Classroom', price: 1199, stock: 14 },
  { id: 'p2', name: 'Science Lab Kit', category: 'Laboratory', price: 249, stock: 7 },
  { id: 'p3', name: 'Student Chromebook', category: 'Technology', price: 389, stock: 42 },
  { id: 'p4', name: 'Library Barcode Scanner', category: 'Library', price: 179, stock: 5 },
  { id: 'p5', name: 'Art Supply Set', category: 'Classroom', price: 59, stock: 26 },
  { id: 'p6', name: 'Digital Microscope', category: 'Laboratory', price: 329, stock: 9 },
  { id: 'p7', name: 'Wi-Fi Access Point', category: 'Technology', price: 219, stock: 18 },
  { id: 'p8', name: 'Reference Encyclopedia', category: 'Library', price: 89, stock: 11 },
  { id: 'p9', name: 'Document Camera', category: 'Classroom', price: 149, stock: 3 },
  { id: 'p10', name: '3D Printer Filament', category: 'Laboratory', price: 34, stock: 34 },
];

@Injectable({ providedIn: 'root' })
export class ProductStore {
  private readonly destroyRef = inject(DestroyRef);
  private readonly productsState = signal<Product[]>([...PRODUCTS]);
  private readonly queryState = signal<ProductQuery>({ search: '', category: 'All' });
  private readonly visibleIdsState = signal<readonly string[]>([]);
  private readonly stockEvents = new Subject<{ id: string; stock: number }>();

  readonly products = this.productsState.asReadonly();
  readonly query = this.queryState.asReadonly();
  readonly categories = computed(() => ['All', ...new Set(this.productsState().map((item) => item.category))]);
  readonly filteredProducts = computed(() => {
    const query = this.queryState();
    const search = query.search.toLowerCase();
    return this.productsState().filter(
      (item) =>
        (query.category === 'All' || item.category === query.category) &&
        item.name.toLowerCase().includes(search),
    );
  });
  readonly error = signal<string | null>(null);

  constructor() {
    interval(1800)
      .pipe(
        map(() => this.visibleIdsState()),
        switchMap((ids) => {
          if (ids.length === 0) return of(null);
          const id = ids[Math.floor(Math.random() * ids.length)];
          const product = this.productsState().find((item) => item.id === id);
          return of(product ? { id, stock: Math.max(0, product.stock + (Math.floor(Math.random() * 7) - 3)) } : null);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => {
        if (event) this.stockEvents.next(event);
      });

    this.stockEvents.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((event) => {
      this.productsState.update((items) =>
        items.map((item) => (item.id === event.id ? { ...item, stock: event.stock } : item)),
      );
    });
  }

  queryProducts(query: ProductQuery): Observable<ProductQuery> {
    return of(query).pipe(delay(120), tap((value) => this.queryState.set(value)));
  }

  setVisibleIds(ids: readonly string[]): void {
    this.visibleIdsState.set(ids);
  }

  save(product: Omit<Product, 'id'> & { readonly id?: string }): void {
    if (product.id) {
      this.productsState.update((items) =>
        items.map((item) => (item.id === product.id ? { ...product, id: product.id! } : item)),
      );
      return;
    }
    this.productsState.update((items) => [...items, { ...product, id: crypto.randomUUID() }]);
  }

  deleteOptimistically(id: string): void {
    const removed = this.productsState().find((item) => item.id === id);
    if (!removed) return;
    const index = this.productsState().indexOf(removed);
    this.error.set(null);
    this.productsState.update((items) => items.filter((item) => item.id !== id));

    of(id)
      .pipe(
        delay(500),
        switchMap((productId) =>
          Math.random() < 0.2 ? throwError(() => new Error(`The server rejected deletion of ${removed.name}.`)) : of(productId),
        ),
        catchError((error: Error) => {
          this.productsState.update((items) => {
            const restored = [...items];
            restored.splice(Math.min(index, restored.length), 0, removed);
            return restored;
          });
          this.error.set(`${error.message} The product was restored.`);
          return of(null);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  dismissError(): void {
    this.error.set(null);
  }
}
