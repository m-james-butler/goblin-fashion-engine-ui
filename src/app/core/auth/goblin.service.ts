import { Injectable, inject } from '@angular/core';
import { Goblin } from '../models/goblin.model';
import { AuthService } from './auth.service';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environments';

@Injectable({
  providedIn: 'root',
})
export class GoblinService {
  private readonly authService = inject(AuthService);

  getCurrentGoblin(): Observable<Goblin | null> {
    return this.authService.user$.pipe(
      map((user) => {
        if (!user) {
          return null;
        }

        return {
          id: user.uid,
          displayName: user.displayName || user.email || 'Unnamed Goblin',
          email: user.email || undefined,
          defaultHoardId: environment.auth.defaultHoardId,
        };
      }),
    );
  }
}
