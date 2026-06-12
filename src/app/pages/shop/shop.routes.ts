import { Routes } from '@angular/router';
import { checkoutStepGuard } from './checkout/checkout.guard';
import { productResolver } from './product.resolver';

export const SHOP_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./catalogue.page').then((module) => module.CataloguePage),
  },
  {
    path: 'products/:id',
    resolve: { product: productResolver },
    loadComponent: () => import('./product-detail.page').then((module) => module.ProductDetailPage),
  },
  {
    path: 'checkout/step/:n',
    canActivate: [checkoutStepGuard],
    loadComponent: () => import('./checkout/checkout.page').then((module) => module.CheckoutPage),
  },
  {
    path: 'order-confirmation/:id',
    loadComponent: () =>
      import('./checkout/order-confirmation.page').then((module) => module.OrderConfirmationPage),
  },
];
