import { Injectable, inject } from '@angular/core';
import { AuthError, User } from 'firebase/auth';
import { BehaviorSubject } from 'rxjs';

import { environment } from '../../../environments/environments';
import { AppLoggerService } from '../logging/app-logger.service';
import { FirebaseAuthGatewayService } from './firebase-auth-gateway.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly logger = inject(AppLoggerService);
  private readonly firebaseAuthGateway = inject(FirebaseAuthGatewayService);
  private readonly userSubject = new BehaviorSubject<User | null>(null);
  readonly user$ = this.userSubject.asObservable();

  constructor() {
    this.firebaseAuthGateway.onAuthStateChanged((user) => {
      this.userSubject.next(user);
      this.logger.info('auth.state.changed', {
        isAuthenticated: Boolean(user),
        providerCount: user?.providerData.length ?? 0,
      });
    });
  }

  get currentUser(): User | null {
    return this.userSubject.value;
  }

  async loginWithPassword(usernameOrEmail: string, password: string): Promise<void> {
    const email = this.resolveEmailFromUsernameOrEmail(usernameOrEmail);
    const usedUsernameInput = !usernameOrEmail.trim().includes('@');
    this.logger.info('auth.password.login.started', {
      usedUsernameInput,
    });
    try {
      await this.firebaseAuthGateway.signInWithPassword(email, password);
      this.logger.info('auth.password.login.succeeded', {
        usedUsernameInput,
      });
    } catch (error) {
      this.logger.warn('auth.password.login.failed', {
        usedUsernameInput,
        authCode: this.extractAuthCode(error),
      });
      throw error;
    }
  }

  async loginWithGoogle(): Promise<void> {
    this.logger.info('auth.google.login.started');
    try {
      await this.firebaseAuthGateway.signInWithGoogle();
      this.logger.info('auth.google.login.succeeded');
    } catch (error) {
      this.logger.warn('auth.google.login.failed', {
        authCode: this.extractAuthCode(error),
      });
      throw error;
    }
  }

  async getCurrentUserIdToken(forceRefresh = false): Promise<string | null> {
    try {
      const idToken = await this.firebaseAuthGateway.getCurrentUserIdToken(forceRefresh);
      if (!idToken) {
        this.logger.debug('auth.token.requested.without.user', { forceRefresh });
        return null;
      }
      this.logger.debug('auth.token.requested.succeeded', { forceRefresh });
      return idToken;
    } catch (error) {
      this.logger.warn('auth.token.requested.failed', {
        forceRefresh,
        authCode: this.extractAuthCode(error),
      });
      throw error;
    }
  }

  async logout(): Promise<void> {
    this.logger.info('auth.logout.started');
    await this.firebaseAuthGateway.signOut();
    this.logger.info('auth.logout.succeeded');
  }

  private resolveEmailFromUsernameOrEmail(usernameOrEmail: string): string {
    const normalizedCredential = usernameOrEmail.trim();
    if (!normalizedCredential) {
      throw new Error('Username or email is required.');
    }

    if (normalizedCredential.includes('@')) {
      return normalizedCredential;
    }

    const usernameEmailDomain = environment.auth.usernameEmailDomain.trim();
    if (!usernameEmailDomain) {
      throw new Error('Username login is not configured for this environment.');
    }

    return `${normalizedCredential}@${usernameEmailDomain}`;
  }

  private extractAuthCode(error: unknown): string {
    if (typeof error === 'object' && error && 'code' in error) {
      return String((error as AuthError).code);
    }
    return 'unknown';
  }
}
