import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { OrderStore } from '../orders/order.store';
import { ProductStore } from '../products/product.store';

@Component({
  selector: 'app-admin-analytics',
  templateUrl: './admin-analytics.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminAnalyticsPage {
  // OnPush updates this summary only when its store signals change.
  protected readonly products = inject(ProductStore);
  protected readonly orders = inject(OrderStore);
  protected readonly totalStock = computed(() =>
    this.products.products().reduce((total, product) => total + product.stock, 0),
  );
}
