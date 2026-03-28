import { Injectable } from '@angular/core';
import {
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

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly userSubject = new BehaviorSubject<User | null>(null);
  readonly user$ = this.userSubject.asObservable();
  private readonly googleProvider = new GoogleAuthProvider();

  constructor() {
    this.googleProvider.setCustomParameters({ prompt: 'select_account' });

    onAuthStateChanged(auth, (user) => {
      this.userSubject.next(user);
    });
  }

  get currentUser(): User | null {
    return this.userSubject.value;
  }

  async loginWithPassword(usernameOrEmail: string, password: string): Promise<void> {
    const email = this.resolveEmailFromUsernameOrEmail(usernameOrEmail);
    await signInWithEmailAndPassword(auth, email, password);
  }

  async loginWithGoogle(): Promise<void> {
    await signInWithPopup(auth, this.googleProvider);
  }

  async getCurrentUserIdToken(forceRefresh = false): Promise<string | null> {
    const user = auth.currentUser;
    if (!user) {
      return null;
    }

    return getIdToken(user, forceRefresh);
  }

  async logout(): Promise<void> {
    await signOut(auth);
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
}
