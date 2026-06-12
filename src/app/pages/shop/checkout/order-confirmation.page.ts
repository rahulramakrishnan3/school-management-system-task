import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-order-confirmation',
  imports: [RouterLink],
  template: `<section class="page-card"><p class="eyebrow">Order confirmed</p><h1>Thank you</h1><p>Your order <strong>{{ orderId }}</strong> has been submitted successfully.</p><a routerLink="/shop">Continue shopping</a></section>`,
  styles: `a { display: inline-block; margin-top: 1rem; padding: .75rem 1rem; border-radius: .65rem; background: #4338ca; color: white; font-weight: 800; text-decoration: none; }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderConfirmationPage {
  // OnPush keeps this resolved confirmation view free from unrelated checks.
  protected readonly orderId = inject(ActivatedRoute).snapshot.paramMap.get('id');
}
