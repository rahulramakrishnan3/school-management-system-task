import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-products-page',
  templateUrl: './products.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsPage {
  // OnPush limits checks to explicit reactive changes, avoiding unrelated UI work.
}
