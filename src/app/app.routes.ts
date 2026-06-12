import { Routes } from '@angular/router';
import { adminGuard, authGuard } from './auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then((module) => module.LoginPage),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/app-shell.component').then((module) => module.AppShellComponent),
    children: [
      {
        path: 'admin',
        canActivate: [adminGuard],
        loadChildren: () => import('./pages/admin/admin.routes').then((module) => module.ADMIN_ROUTES),
      },
      {
        path: 'shop',
        loadChildren: () => import('./pages/shop/shop.routes').then((module) => module.SHOP_ROUTES),
      },
      { path: 'products', pathMatch: 'full', redirectTo: 'shop' },
    ],
  },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'login' },
];
