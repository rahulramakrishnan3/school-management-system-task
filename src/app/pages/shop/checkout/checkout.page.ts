import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { delay, of, switchMap, throwError } from 'rxjs';
import { CartItem, CartService } from '../cart.service';
import { CardNumberControlComponent } from './card-number-control.component';
import { CheckoutStateService } from './checkout-state.service';
import { DynamicFormComponent } from './dynamic-form.component';
import { DynamicFieldConfig, FieldValidation } from './dynamic-form.types';
import { OrderTotalPipe } from './order-total.pipe';

const BILLING_FIELDS: readonly DynamicFieldConfig[] = [
  { key: 'billingAddress', label: 'Billing street address', type: 'text', visibleWhen: { field: 'sameAsDelivery', equals: false }, validations: [{ type: 'required' }] },
  { key: 'billingCity', label: 'Billing city', type: 'text', visibleWhen: { field: 'sameAsDelivery', equals: false }, validations: [{ type: 'required' }] },
  { key: 'billingPostalCode', label: 'Billing postal code', type: 'text', visibleWhen: { field: 'sameAsDelivery', equals: false }, validations: [{ type: 'required' }] },
];

@Component({
  selector: 'app-checkout',
  imports: [ReactiveFormsModule, RouterLink, DynamicFormComponent, CardNumberControlComponent, OrderTotalPipe],
  templateUrl: './checkout.page.html',
  styleUrl: './checkout.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutPage {
  // OnPush scopes the multi-step form to route, form, cart, and submission signal changes.
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly state = inject(CheckoutStateService);
  protected readonly cart = inject(CartService);
  protected readonly step = signal(Number(this.route.snapshot.paramMap.get('n')) || 1);
  protected readonly deliveryConfig = signal<readonly DynamicFieldConfig[]>([]);
  protected readonly billingConfig = BILLING_FIELDS;
  protected readonly submitting = signal(false);
  protected readonly submitError = signal<string | null>(null);
  protected readonly deliveryForm = new FormGroup({});
  protected readonly paymentForm = new FormGroup({
    cardNumber: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    expiry: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    sameAsDelivery: new FormControl(true, { nonNullable: true }),
    billingAddress: new FormControl('', { nonNullable: true }),
    billingCity: new FormControl('', { nonNullable: true }),
    billingPostalCode: new FormControl('', { nonNullable: true }),
  });

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => this.step.set(Number(params.get('n')) || 1));
    fetch('/assets/checkout-form.json')
      .then((response) => response.json() as Promise<readonly DynamicFieldConfig[]>)
      .then((config) => {
        this.deliveryConfig.set(config);
        for (const field of config) this.deliveryForm.addControl(field.key, new FormControl('', this.validators(field.validations)));
      });
    this.deliveryForm.statusChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.state.deliveryValid.set(this.deliveryForm.valid));
  }

  protected update(item: CartItem, value: string): void { this.cart.updateQuantity(item.product.id, Number(value)); }
  protected goToDelivery(): void { void this.router.navigate(['/shop/checkout/step/2']); }
  protected goToPayment(): void {
    if (this.deliveryForm.invalid) { this.deliveryForm.markAllAsTouched(); return; }
    this.state.deliveryValid.set(true);
    void this.router.navigate(['/shop/checkout/step/3']);
  }

  protected submit(): void {
    if (this.paymentForm.invalid) { this.paymentForm.markAllAsTouched(); return; }
    const snapshot = this.cart.items();
    this.submitting.set(true);
    this.submitError.set(null);
    this.cart.clear();
    const id = `ORD-${Date.now().toString().slice(-6)}`;
    of({ id, delivery: this.deliveryForm.getRawValue(), payment: this.paymentForm.getRawValue() })
      .pipe(
        delay(650),
        switchMap((payload) => Math.random() < 0.15 ? throwError(() => new Error('Payment authorization failed.')) : of(payload)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => void this.router.navigate(['/shop/order-confirmation', id]),
        error: (error: Error) => {
          this.cart.replace(snapshot);
          this.submitError.set(`${error.message} Your cart has been restored.`);
          this.submitting.set(false);
        },
      });
  }

  private validators(config: readonly FieldValidation[] = []) {
    return config.map((validation) => {
      if (validation.type === 'email') return Validators.email;
      if (validation.type === 'minLength') return Validators.minLength(validation.value ?? 0);
      return Validators.required;
    });
  }
}
