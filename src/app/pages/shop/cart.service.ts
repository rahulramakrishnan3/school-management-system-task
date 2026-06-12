import { Injectable, computed, effect, signal } from '@angular/core';
import { Product } from '../admin/products/product.store';

const CART_KEY = 'product-management-cart';

export interface CartItem {
  readonly product: Product;
  readonly quantity: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly itemsState = signal<CartItem[]>(this.hydrate());

  readonly items = this.itemsState.asReadonly();
  readonly itemCount = computed(() => this.itemsState().reduce((count, item) => count + item.quantity, 0));
  readonly subtotal = computed(() =>
    this.itemsState().reduce((total, item) => total + item.product.price * item.quantity, 0),
  );

  constructor() {
    effect(() => localStorage.setItem(CART_KEY, JSON.stringify(this.itemsState())));
  }

  add(product: Product, quantity = 1): void {
    this.itemsState.update((items) => {
      const existing = items.find((item) => item.product.id === product.id);
      if (!existing) return [...items, { product, quantity: Math.min(quantity, product.stock) }];
      return items.map((item) =>
        item.product.id === product.id
          ? { ...item, product, quantity: Math.min(item.quantity + quantity, product.stock) }
          : item,
      );
    });
  }

  updateQuantity(id: string, quantity: number): void {
    this.itemsState.update((items) =>
      items.map((item) =>
        item.product.id === id
          ? { ...item, quantity: Math.max(1, Math.min(quantity, item.product.stock)) }
          : item,
      ),
    );
  }

  remove(id: string): void {
    this.itemsState.update((items) => items.filter((item) => item.product.id !== id));
  }

  replace(items: readonly CartItem[]): void {
    this.itemsState.set([...items]);
  }

  clear(): void {
    this.itemsState.set([]);
  }

  private hydrate(): CartItem[] {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY) ?? '[]') as CartItem[];
    } catch {
      return [];
    }
  }
}
