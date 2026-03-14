import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Hoard } from '../models/hoard.model';
import { Shiny } from '../models/shiny.model';
import { GoblinService } from '../auth/goblin.service';

@Injectable({
  providedIn: 'root',
})
export class HoardService {
  private readonly inventoryPath = '/resources/inventory.json';

  constructor(
    private readonly http: HttpClient,
    private readonly goblinService: GoblinService,
  ) {}

  getHoardById(hoardId: string): Observable<Hoard | null> {
    return this.goblinService.getCurrentGoblin().pipe(
      switchMap((goblin) => {
        if (!goblin) {
          return of(null);
        }

        return this.http.get<Shiny[]>(this.inventoryPath).pipe(
          map((shinies) => ({
            id: hoardId,
            name: 'Main Hoard',
            goblinId: goblin.id,
            shinies,
          })),
        );
      }),
    );
  }

  getCurrentHoard(): Observable<Hoard | null> {
    return this.goblinService.getCurrentGoblin().pipe(
      switchMap((goblin) => {
        if (!goblin) {
          return of(null);
        }

        return this.getHoardById(goblin.hoardId).pipe(
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
