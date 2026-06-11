import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-admin-page',
  templateUrl: './admin.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminPage {
  // OnPush limits checks to explicit reactive changes, avoiding unrelated UI work.
}
