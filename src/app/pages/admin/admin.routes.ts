import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./admin.page').then((module) => module.AdminPage),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'products' },
      {
        path: 'products',
        loadComponent: () =>
          import('./products/admin-products.page').then((module) => module.AdminProductsPage),
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./orders/admin-orders.page').then((module) => module.AdminOrdersPage),
      },
      {
        path: 'analytics',
        loadComponent: () =>
          import('./analytics/admin-analytics.page').then((module) => module.AdminAnalyticsPage),
      },
    ],
  },
];
