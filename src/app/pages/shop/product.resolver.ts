import { inject } from '@angular/core';
import { RedirectCommand, ResolveFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { Product, ProductStore } from '../admin/products/product.store';

export const productResolver: ResolveFn<Product> = (route) => {
  const store = inject(ProductStore);
  const router = inject(Router);
  return store.getById(route.paramMap.get('id') ?? '').pipe(
    map((product) => product ?? new RedirectCommand(router.createUrlTree(['/shop']))),
  );
};
