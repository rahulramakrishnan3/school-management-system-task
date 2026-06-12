import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { combineLatest, debounceTime, distinctUntilChanged, startWith, switchMap } from 'rxjs';
import { Product, ProductStore } from './product.store';

type SortKey = 'name' | 'category' | 'price' | 'stock';

@Component({
  selector: 'app-admin-products',
  imports: [ReactiveFormsModule],
  templateUrl: './admin-products.page.html',
  styleUrl: './admin-products.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminProductsPage {
  // OnPush lets signals and reactive form events update only the affected product UI.
  private readonly destroyRef = inject(DestroyRef);
  protected readonly store = inject(ProductStore);
  protected readonly search = new FormControl('', { nonNullable: true });
  protected readonly category = new FormControl('All', { nonNullable: true });
  protected readonly page = signal(1);
  protected readonly pageSize = 5;
  protected readonly sortKey = signal<SortKey>('name');
  protected readonly sortDirection = signal<1 | -1>(1);
  protected readonly editing = signal<Product | null | undefined>(undefined);
  protected readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    category: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    price: new FormControl(0, { nonNullable: true, validators: [Validators.required, Validators.min(0)] }),
    stock: new FormControl(0, { nonNullable: true, validators: [Validators.required, Validators.min(0)] }),
  });
  protected readonly sortedProducts = computed(() =>
    [...this.store.filteredProducts()].sort((a, b) => {
      const key = this.sortKey();
      return (typeof a[key] === 'string'
        ? String(a[key]).localeCompare(String(b[key]))
        : Number(a[key]) - Number(b[key])) * this.sortDirection();
    }),
  );
  protected readonly pageCount = computed(() => Math.max(1, Math.ceil(this.sortedProducts().length / this.pageSize)));
  protected readonly visibleProducts = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.sortedProducts().slice(start, start + this.pageSize);
  });

  constructor() {
    combineLatest([
      this.search.valueChanges.pipe(startWith(this.search.value), debounceTime(250), distinctUntilChanged()),
      this.category.valueChanges.pipe(startWith(this.category.value), distinctUntilChanged()),
    ])
      .pipe(
        switchMap(([search, category]) => this.store.queryProducts({ search, category })),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.page.set(1));

    effect(() => this.store.setVisibleIds(this.visibleProducts().map((product) => product.id)));
  }

  protected sort(key: SortKey): void {
    if (this.sortKey() === key) this.sortDirection.update((value) => (value === 1 ? -1 : 1));
    else {
      this.sortKey.set(key);
      this.sortDirection.set(1);
    }
  }

  protected openForm(product?: Product): void {
    this.editing.set(product ?? null);
    this.form.reset(product ?? { name: '', category: '', price: 0, stock: 0 });
  }

  protected closeForm(): void {
    this.editing.set(undefined);
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.store.save({ ...this.form.getRawValue(), id: this.editing()?.id });
    this.closeForm();
  }

  protected nextPage(): void {
    this.page.update((page) => Math.min(this.pageCount(), page + 1));
  }
}
