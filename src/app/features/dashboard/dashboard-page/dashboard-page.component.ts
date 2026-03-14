import { Component } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-dashboard-page',
  imports: [],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss',
})
export class DashboardPageComponent {
  constructor(private authService: AuthService) {
    this.authService.user$.subscribe((user) => {
      console.log('Firebase user:', user);
    });
  }

  async login(): Promise<void> {
    await this.authService.login('m.james.butler@gmail.com', 'testpassword');
  }

  async logout(): Promise<void> {
    await this.authService.logout();
  }
}
