import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CartService } from '../cart.service';
import { CheckoutStateService } from './checkout-state.service';

export const checkoutStepGuard: CanActivateFn = (route) => {
  const cart = inject(CartService);
  const state = inject(CheckoutStateService);
  const router = inject(Router);
  const step = Number(route.paramMap.get('n'));

  if (cart.itemCount() === 0) return router.createUrlTree(['/shop']);
  if (step === 2 || (step === 3 && state.deliveryValid())) return true;
  if (step === 1) return true;
  return router.createUrlTree(['/shop/checkout/step/2']);
};
