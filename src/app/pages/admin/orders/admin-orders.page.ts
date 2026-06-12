import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Order, OrderStatus, OrderStore } from './order.store';

type OrderSortKey = 'id' | 'customer' | 'status' | 'date' | 'total';

@Component({
  selector: 'app-admin-orders',
  imports: [ReactiveFormsModule],
  templateUrl: './admin-orders.page.html',
  styleUrl: './admin-orders.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminOrdersPage {
  // OnPush lets shared-store signals update the table and drawer without broad page checks.
  protected readonly store = inject(OrderStore);
  protected readonly statuses: readonly (OrderStatus | 'All')[] = ['All', 'Pending', 'Confirmed', 'Cancelled'];
  protected readonly startDate = new FormControl('', { nonNullable: true });
  protected readonly endDate = new FormControl('', { nonNullable: true });
  protected readonly selectedId = signal<string | null>(null);
  protected readonly selectedOrder = computed(() => this.store.orders().find((order) => order.id === this.selectedId()) ?? null);
  protected readonly page = signal(1);
  protected readonly pageSize = 5;
  protected readonly sortKey = signal<OrderSortKey>('date');
  protected readonly sortDirection = signal<1 | -1>(-1);
  protected readonly sortedOrders = computed(() =>
    [...this.store.filteredOrders()].sort((a, b) => {
      const key = this.sortKey();
      const first = key === 'total' ? this.store.total(a) : a[key];
      const second = key === 'total' ? this.store.total(b) : b[key];
      return (typeof first === 'string' ? first.localeCompare(String(second)) : first - Number(second)) * this.sortDirection();
    }),
  );
  protected readonly pageCount = computed(() => Math.max(1, Math.ceil(this.sortedOrders().length / this.pageSize)));
  protected readonly visibleOrders = computed(() => this.sortedOrders().slice((this.page() - 1) * this.pageSize, this.page() * this.pageSize));

  protected sort(key: OrderSortKey): void {
    if (this.sortKey() === key) this.sortDirection.update((value) => (value === 1 ? -1 : 1));
    else { this.sortKey.set(key); this.sortDirection.set(1); }
  }

  protected filterStatus(status: OrderStatus | 'All'): void { this.store.setStatusFilter(status); this.page.set(1); }
  protected filterDates(): void { this.store.setDateRange(this.startDate.value, this.endDate.value); this.page.set(1); }
  protected select(order: Order): void { this.selectedId.set(order.id); }
  protected close(): void { this.selectedId.set(null); }
  protected updateStatus(status: string): void {
    const order = this.selectedOrder();
    if (order) this.store.updateStatus(order.id, status as OrderStatus);
  }
}
