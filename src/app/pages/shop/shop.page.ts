import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-shop-page',
  templateUrl: './shop.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShopPage {
  // OnPush limits checks to explicit reactive changes, avoiding unrelated UI work.
}
