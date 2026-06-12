import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CheckoutStateService {
  readonly deliveryValid = signal(false);
}
