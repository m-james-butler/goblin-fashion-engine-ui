import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { ApiService } from './api.service';
import { GoblinService } from '../auth/goblin.service';
import { Hoard } from '../models/hoard.model';
import { Shiny } from '../models/shiny.model';
import { AppLoggerService } from '../logging/app-logger.service';

type HoardWithShinies = Hoard & { shinies: Shiny[] };

@Injectable({
  providedIn: 'root',
})
export class HoardService {
  private readonly http = inject(HttpClient);
  private readonly apiService = inject(ApiService);
  private readonly goblinService = inject(GoblinService);
  private readonly logger = inject(AppLoggerService);

  getHoardById(hoardId: string): Observable<HoardWithShinies | null> {
    return this.goblinService.getCurrentGoblin().pipe(
      switchMap((goblin) => {
        if (!goblin) {
          this.logger.warn('hoard.lookup.skipped.no-authenticated-user', { hoardId });
          return of(null);
        }

        const shiniesUrl = this.apiService.buildGoblinHoardShiniesPath(goblin.id, hoardId);
        this.logger.debug('hoard.lookup.started', {
          endpoint: sanitizeEndpoint(shiniesUrl),
          hoardId,
        });
        return this.http.get<Shiny[]>(shiniesUrl).pipe(
          map((shinies) => {
            this.logger.info('hoard.lookup.succeeded', {
              hoardId,
              shinyCount: shinies.length,
            });
            return {
              id: hoardId,
              name: 'Main Hoard',
              goblinId: goblin.id,
              isDefault: hoardId === goblin.defaultHoardId,
              isActive: true,
              shinies,
            };
          }),
        );
      }),
    );
  }

  getCurrentHoard(): Observable<HoardWithShinies | null> {
    return this.goblinService.getCurrentGoblin().pipe(
      switchMap((goblin) => {
        if (!goblin) {
          this.logger.warn('hoard.current.lookup.skipped.no-authenticated-user');
          return of(null);
        }

        return this.getHoardById(goblin.defaultHoardId).pipe(
          catchError((error) => {
            this.logger.error('hoard.current.lookup.failed', { error });
            return of(null);
          }),
        );
      }),
    );
  }

  getShiniesForCurrentHoard(): Observable<Shiny[]> {
    return this.getCurrentHoard().pipe(
      map((hoard) => hoard?.shinies ?? []),
      catchError((error) => {
        this.logger.error('hoard.shinies.lookup.failed', { error });
        return of([]);
      }),
    );
  }
}

function sanitizeEndpoint(url: string): string {
  return url
    .replace(/\/goblins\/[^/]+/g, '/goblins/{goblinId}')
    .replace(/\/hoards\/[^/]+/g, '/hoards/{hoardId}')
    .replace(/\/shinies\/[^/?]+/g, '/shinies/{shinyId}');
}
