import { Injectable } from '@angular/core';
import { Goblin } from '../models/goblin.model';
import { AuthService } from './auth.service';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GoblinService {
  constructor(private authService: AuthService) {
    //intentionally left blank
  }

  getCurrentGoblin(): Observable<Goblin | null> {
    return this.authService.user$.pipe(
      map((user) => {
        if (!user) {
          return null;
        }

        return {
          id: user.uid,
          name: user.displayName || user.email || 'Unnamed Goblin',
          hoardId: 'main',
        };
      }),
    );
  }
}
