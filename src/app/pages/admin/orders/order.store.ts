import { Injectable, computed, signal } from '@angular/core';

export type OrderStatus = 'Pending' | 'Confirmed' | 'Cancelled';

export interface OrderLine {
  readonly product: string;
  readonly quantity: number;
  readonly unitPrice: number;
}

export interface Order {
  readonly id: string;
  readonly customer: string;
  readonly lines: readonly OrderLine[];
  readonly status: OrderStatus;
  readonly date: string;
}

const ORDERS: readonly Order[] = [
  { id: 'ORD-1048', customer: 'Northview Academy', status: 'Pending', date: '2026-06-11', lines: [{ product: 'Student Chromebook', quantity: 12, unitPrice: 389 }] },
  { id: 'ORD-1047', customer: 'Riverside School', status: 'Confirmed', date: '2026-06-09', lines: [{ product: 'Science Lab Kit', quantity: 4, unitPrice: 249 }, { product: 'Digital Microscope', quantity: 2, unitPrice: 329 }] },
  { id: 'ORD-1046', customer: 'Brighton College', status: 'Cancelled', date: '2026-06-05', lines: [{ product: 'Interactive Whiteboard', quantity: 1, unitPrice: 1199 }] },
  { id: 'ORD-1045', customer: 'Oakwood Primary', status: 'Confirmed', date: '2026-05-29', lines: [{ product: 'Art Supply Set', quantity: 20, unitPrice: 59 }] },
  { id: 'ORD-1044', customer: 'Central Library', status: 'Pending', date: '2026-05-21', lines: [{ product: 'Reference Encyclopedia', quantity: 8, unitPrice: 89 }, { product: 'Library Barcode Scanner', quantity: 2, unitPrice: 179 }] },
  { id: 'ORD-1043', customer: 'Westfield School', status: 'Confirmed', date: '2026-05-14', lines: [{ product: 'Document Camera', quantity: 5, unitPrice: 149 }] },
  { id: 'ORD-1042', customer: 'Hillcrest Academy', status: 'Cancelled', date: '2026-05-02', lines: [{ product: 'Wi-Fi Access Point', quantity: 6, unitPrice: 219 }] },
];

@Injectable({ providedIn: 'root' })
export class OrderStore {
  private readonly ordersState = signal<Order[]>([...ORDERS]);
  private readonly statusState = signal<OrderStatus | 'All'>('All');
  private readonly startDateState = signal('');
  private readonly endDateState = signal('');

  readonly orders = this.ordersState.asReadonly();
  readonly status = this.statusState.asReadonly();
  readonly startDate = this.startDateState.asReadonly();
  readonly endDate = this.endDateState.asReadonly();
  readonly filteredOrders = computed(() =>
    this.ordersState().filter(
      (order) =>
        (this.statusState() === 'All' || order.status === this.statusState()) &&
        (!this.startDateState() || order.date >= this.startDateState()) &&
        (!this.endDateState() || order.date <= this.endDateState()),
    ),
  );

  setStatusFilter(status: OrderStatus | 'All'): void { this.statusState.set(status); }
  setDateRange(start: string, end: string): void { this.startDateState.set(start); this.endDateState.set(end); }
  updateStatus(id: string, status: OrderStatus): void {
    this.ordersState.update((orders) => orders.map((order) => (order.id === id ? { ...order, status } : order)));
  }

  total(order: Order): number {
    return order.lines.reduce((total, line) => total + line.quantity * line.unitPrice, 0);
  }
}
