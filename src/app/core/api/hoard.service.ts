import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { ApiService } from './api.service';
import { GoblinService } from '../auth/goblin.service';
import { Hoard } from '../models/hoard.model';
import { Shiny } from '../models/shiny.model';

type HoardWithShinies = Hoard & { shinies: Shiny[] };

@Injectable({
  providedIn: 'root',
})
export class HoardService {
  private readonly http = inject(HttpClient);
  private readonly apiService = inject(ApiService);
  private readonly goblinService = inject(GoblinService);

  getHoardById(hoardId: string): Observable<HoardWithShinies | null> {
    return this.goblinService.getCurrentGoblin().pipe(
      switchMap((goblin) => {
        if (!goblin) {
          return of(null);
        }

        const shiniesUrl = this.apiService.buildGoblinHoardShiniesPath(goblin.id, hoardId);
        return this.http.get<Shiny[]>(shiniesUrl).pipe(
          map((shinies) => ({
            id: hoardId,
            name: 'Main Hoard',
            goblinId: goblin.id,
            isDefault: hoardId === goblin.defaultHoardId,
            isActive: true,
            shinies,
          })),
        );
      }),
    );
  }

  getCurrentHoard(): Observable<HoardWithShinies | null> {
    return this.goblinService.getCurrentGoblin().pipe(
      switchMap((goblin) => {
        if (!goblin) {
          return of(null);
        }

        return this.getHoardById(goblin.defaultHoardId).pipe(
          catchError(() => of(null)),
        );
      }),
    );
  }

  getShiniesForCurrentHoard(): Observable<Shiny[]> {
    return this.getCurrentHoard().pipe(
      map((hoard) => hoard?.shinies ?? []),
      catchError(() => of([])),
    );
  }
}
