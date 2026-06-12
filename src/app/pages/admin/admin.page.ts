import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin-page',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './admin.page.html',
  styleUrl: './admin.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminPage {
  // OnPush keeps the admin shell limited to router and reactive child updates.
}
