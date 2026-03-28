import { Injectable, inject } from '@angular/core';
import {
  AuthError,
  GoogleAuthProvider,
  User,
  getIdToken,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { BehaviorSubject } from 'rxjs';

import { auth } from '../firebase/firebase';
import { environment } from '../../../environments/environments';
import { AppLoggerService } from '../logging/app-logger.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly logger = inject(AppLoggerService);
  private readonly userSubject = new BehaviorSubject<User | null>(null);
  readonly user$ = this.userSubject.asObservable();
  private readonly googleProvider = new GoogleAuthProvider();

  constructor() {
    this.googleProvider.setCustomParameters({ prompt: 'select_account' });

    onAuthStateChanged(auth, (user) => {
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
      await signInWithEmailAndPassword(auth, email, password);
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
      await signInWithPopup(auth, this.googleProvider);
      this.logger.info('auth.google.login.succeeded');
    } catch (error) {
      this.logger.warn('auth.google.login.failed', {
        authCode: this.extractAuthCode(error),
      });
      throw error;
    }
  }

  async getCurrentUserIdToken(forceRefresh = false): Promise<string | null> {
    const user = auth.currentUser;
    if (!user) {
      this.logger.debug('auth.token.requested.without.user', { forceRefresh });
      return null;
    }

    try {
      const idToken = await getIdToken(user, forceRefresh);
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
    await signOut(auth);
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
