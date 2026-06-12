import { Pipe, PipeTransform } from '@angular/core';

export interface OrderTotals {
  readonly subtotal: number;
  readonly tax: number;
  readonly total: number;
}

@Pipe({ name: 'orderTotal', standalone: true, pure: true })
export class OrderTotalPipe implements PipeTransform {
  transform(subtotal: number, taxRate = 0.08): OrderTotals {
    const tax = subtotal * taxRate;
    return { subtotal, tax, total: subtotal + tax };
  }
}
