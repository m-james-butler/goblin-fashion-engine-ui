import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { GoblinService } from '../auth/goblin.service';
import { Hoard } from '../models/hoard.model';
import { Shiny } from '../models/shiny.model';
import { AppLoggerService } from '../logging/app-logger.service';
import { ShinyApiService } from './shiny-api.service';
import { ShinyAdapter } from './adapters/shiny.adapter';

type HoardWithShinies = Hoard & { shinies: Shiny[] };

@Injectable({
  providedIn: 'root',
})
export class HoardService {
  private readonly goblinService = inject(GoblinService);
  private readonly shinyApiService = inject(ShinyApiService);
  private readonly shinyAdapter = inject(ShinyAdapter);
  private readonly logger = inject(AppLoggerService);

  getHoardById(hoardId: string): Observable<HoardWithShinies | null> {
    return this.goblinService.getCurrentGoblin().pipe(
      switchMap((goblin) => {
        if (!goblin) {
          this.logger.warn('hoard.lookup.skipped.no-authenticated-user', { hoardId });
          return of(null);
        }

        this.logger.debug('hoard.lookup.started', { hoardId });
        return this.shinyApiService.getShiniesByGoblinAndHoard(goblin.id, hoardId).pipe(
          map((shinyDtos) => {
            const shinies = this.shinyAdapter.fromDtoList(shinyDtos);
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
