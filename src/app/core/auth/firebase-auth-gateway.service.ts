/* istanbul ignore file */
import { Injectable } from '@angular/core';
import {
  GoogleAuthProvider,
  User,
  getIdToken,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';

import { auth } from '../firebase/firebase';

@Injectable({
  providedIn: 'root',
})
export class FirebaseAuthGatewayService {
  private readonly googleProvider = new GoogleAuthProvider();

  constructor() {
    this.googleProvider.setCustomParameters({ prompt: 'select_account' });
  }

  onAuthStateChanged(callback: (user: User | null) => void): void {
    onAuthStateChanged(auth, callback);
  }

  signInWithPassword(email: string, password: string): Promise<unknown> {
    return signInWithEmailAndPassword(auth, email, password);
  }

  signInWithGoogle(): Promise<unknown> {
    return signInWithPopup(auth, this.googleProvider);
  }

  signOut(): Promise<void> {
    return signOut(auth);
  }

  getCurrentUserIdToken(forceRefresh: boolean): Promise<string | null> {
    const user = auth.currentUser;
    if (!user) {
      return Promise.resolve(null);
    }
    return getIdToken(user, forceRefresh);
  }
}
