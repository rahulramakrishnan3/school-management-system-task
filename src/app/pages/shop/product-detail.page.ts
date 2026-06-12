import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Product, ProductStore } from '../admin/products/product.store';
import { CartService } from './cart.service';
import { ProductCardComponent } from './product-card.component';

@Component({
  selector: 'app-product-detail',
  imports: [ProductCardComponent],
  templateUrl: './product-detail.page.html',
  styleUrl: './product-detail.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetailPage {
  // OnPush limits detail rendering to quantity, cart, and shared stock signal changes.
  private readonly route = inject(ActivatedRoute);
  protected readonly store = inject(ProductStore);
  protected readonly cart = inject(CartService);
  protected readonly product = this.route.snapshot.data['product'] as Product;
  protected readonly quantity = signal(1);
  protected readonly related = computed(() =>
    this.store.products().filter((item) => item.category === this.product.category && item.id !== this.product.id).slice(0, 4),
  );

  protected changeQuantity(delta: number): void {
    this.quantity.update((value) => Math.max(1, Math.min(this.product.stock, value + delta)));
  }
}
