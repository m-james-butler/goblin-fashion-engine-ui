import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  OnInit,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss',
})
export class LoginPageComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  readonly user$ = this.authService.user$;

  usernameOrEmail = '';
  password = '';
  isSubmitting = false;
  errorMessage: string | null = null;

  ngOnInit(): void {
    this.user$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((user) => {
        if (!user) {
          return;
        }

        void this.navigateToPostLoginDestination();
      });
  }

  async loginWithPassword(): Promise<void> {
    this.errorMessage = null;
    this.isSubmitting = true;
    this.changeDetectorRef.markForCheck();

    try {
      await this.authService.loginWithPassword(this.usernameOrEmail, this.password);
      await this.navigateToPostLoginDestination();
    } catch {
      this.errorMessage = 'Sign-in failed. Check your username/email and password.';
    } finally {
      this.isSubmitting = false;
      this.changeDetectorRef.markForCheck();
    }
  }

  async loginWithGoogle(): Promise<void> {
    this.errorMessage = null;
    this.isSubmitting = true;
    this.changeDetectorRef.markForCheck();

    try {
      await this.authService.loginWithGoogle();
      await this.navigateToPostLoginDestination();
    } catch {
      this.errorMessage = 'Google sign-in failed. Please try again.';
    } finally {
      this.isSubmitting = false;
      this.changeDetectorRef.markForCheck();
    }
  }

  private async navigateToPostLoginDestination(): Promise<void> {
    const redirectTo = this.route.snapshot.queryParamMap.get('redirectTo') || '/';
    await this.router.navigateByUrl(redirectTo);
  }
}
