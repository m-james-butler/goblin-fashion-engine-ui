import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncPipe],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss',
})
export class DashboardPageComponent {
  private readonly authService = inject(AuthService);
  readonly user$ = this.authService.user$;

  async signInWithDemoAccount(): Promise<void> {
    await this.authService.login('m.james.butler@gmail.com', 'testpassword');
  }

  async signOutCurrentSession(): Promise<void> {
    await this.authService.logout();
  }
}
