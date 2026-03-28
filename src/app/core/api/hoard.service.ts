import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay, switchMap } from 'rxjs/operators';
import { Hoard } from '../models/hoard.model';
import { Shiny } from '../models/shiny.model';
import { GoblinService } from '../auth/goblin.service';
import {
  Attention,
  Color,
  Context,
  EngineInclusionPolicy,
  Formality,
  Layer,
  Pattern,
  ShinyCategory,
  ShinyStatus,
} from '../models/enums';

type HoardWithShinies = Hoard & { shinies: Shiny[] };
type LegacyShiny = {
  id: string;
  count: number;
  category: string;
  subcategory?: string | null;
  filename?: string | null;
  primaryContext?: string | null;
  secondaryContext?: string | null;
  formality?: string | null;
  warmth?: number | null;
  layer?: string | null;
  colorPrimary?: string | null;
  colorSecondary?: string | null;
  pattern?: string | null;
  fabric?: string | null;
  fit?: string | null;
  officeOk?: boolean | null;
  publicWear?: boolean | null;
  imagePath?: string | null;
  includeInEngine?: boolean | null;
  status?: string | null;
  notes?: string | null;
  attentionLevel?: string | null;
};

@Injectable({
  providedIn: 'root',
})
export class HoardService {
  private readonly http = inject(HttpClient);
  private readonly goblinService = inject(GoblinService);
  private readonly inventoryPath = '/resources/inventory.json';
  private readonly inventory$ = this.http
    .get<LegacyShiny[]>(this.inventoryPath)
    .pipe(
    // Cache inventory responses to avoid duplicate static-file fetches.
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  getHoardById(hoardId: string): Observable<HoardWithShinies | null> {
    return this.goblinService.getCurrentGoblin().pipe(
      switchMap((goblin) => {
        if (!goblin) {
          return of(null);
        }

        return this.inventory$.pipe(
          map((legacyShinies) => ({
            id: hoardId,
            name: 'Main Hoard',
            goblinId: goblin.id,
            isDefault: true,
            isActive: true,
            shinies: legacyShinies.map((legacyShiny) =>
              this.normalizeLegacyShiny(legacyShiny, goblin.id, hoardId),
            ),
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

  private normalizeLegacyShiny(
    legacyShiny: LegacyShiny,
    goblinId: string,
    hoardId: string,
  ): Shiny {
    const contexts = [legacyShiny.primaryContext, legacyShiny.secondaryContext]
      .map((context) => this.toContext(context))
      .filter((context): context is Context => Boolean(context));

    const includeInEngine = legacyShiny.includeInEngine ?? true;

    return {
      id: legacyShiny.id,
      goblinId,
      hoardId,
      name: legacyShiny.id,
      count: legacyShiny.count,
      category: this.toCategory(legacyShiny.category),
      subcategory: legacyShiny.subcategory ?? undefined,
      layer: this.toLayer(legacyShiny.layer),
      contexts: contexts.length > 0 ? contexts : [Context.CASUAL],
      formality: this.toFormality(legacyShiny.formality),
      attention: this.toAttention(legacyShiny.attentionLevel),
      colorPrimary: this.toColor(legacyShiny.colorPrimary),
      colorSecondary: this.toColorOptional(legacyShiny.colorSecondary),
      pattern: this.toPattern(legacyShiny.pattern),
      fabric: legacyShiny.fabric ?? undefined,
      fit: legacyShiny.fit ?? undefined,
      warmth: legacyShiny.warmth ?? undefined,
      officeOk: legacyShiny.officeOk ?? false,
      publicWear: legacyShiny.publicWear ?? true,
      includeInEngine,
      engineInclusionPolicy: includeInEngine
        ? EngineInclusionPolicy.NORMAL
        : EngineInclusionPolicy.EXCLUDE,
      imagePath: legacyShiny.imagePath ?? undefined,
      status: this.toStatus(legacyShiny.status),
      notes: legacyShiny.notes ?? undefined,
    };
  }

  private normalizeEnumToken(value: string): string {
    return value.trim().toUpperCase().replaceAll(/[\s-]+/g, '_');
  }

  private toCategory(value: string | null | undefined): ShinyCategory {
    const normalized = this.normalizeEnumToken(value ?? '');

    switch (normalized) {
      case 'ACESSORIES':
      case 'ACCESSORIES':
        return ShinyCategory.ACCESSORY;
      case 'ATHLETIC_GEAR':
        return ShinyCategory.ACTIVEWEAR;
      case 'OUTERWEAR':
        return ShinyCategory.OUTERWEAR;
      case 'PANTS':
      case 'SHORTS':
        return ShinyCategory.BOTTOM;
      case 'SHIRTS':
        return ShinyCategory.TOP;
      case 'SHOES':
        return ShinyCategory.SHOES;
      case 'SOCKS':
      case 'UNDERWEAR':
        return ShinyCategory.UNDERGARMENT;
      default:
        return ShinyCategory.ACCESSORY;
    }
  }

  private toLayer(value: string | null | undefined): Layer {
    const normalized = this.normalizeEnumToken(value ?? '');
    if (normalized in Layer) {
      return Layer[normalized as keyof typeof Layer];
    }
    return Layer.BASE;
  }

  private toContext(value: string | null | undefined): Context | null {
    if (!value || value.trim() === '') {
      return null;
    }

    const normalized = this.normalizeEnumToken(value);
    if (normalized === 'EVENT') {
      return Context.FESTIVAL;
    }
    if (normalized in Context) {
      return Context[normalized as keyof typeof Context];
    }
    return null;
  }

  private toFormality(value: string | null | undefined): Formality {
    const normalized = this.normalizeEnumToken(value ?? '');
    switch (normalized) {
      case 'ALWAYS':
      case 'FUNCTIONAL':
      case 'GYM':
        return Formality.CASUAL;
      default:
        if (normalized in Formality) {
          return Formality[normalized as keyof typeof Formality];
        }
        return Formality.CASUAL;
    }
  }

  private toAttention(value: string | null | undefined): Attention {
    const normalized = this.normalizeEnumToken(value ?? '');
    if (normalized in Attention) {
      return Attention[normalized as keyof typeof Attention];
    }
    return Attention.LOW;
  }

  private toColor(value: string | null | undefined): Color {
    const normalized = this.normalizeEnumToken(value ?? '');
    if (normalized in Color) {
      return Color[normalized as keyof typeof Color];
    }
    return Color.BLACK;
  }

  private toColorOptional(value: string | null | undefined): Color | undefined {
    if (!value) {
      return undefined;
    }
    return this.toColor(value);
  }

  private toPattern(value: string | null | undefined): Pattern | undefined {
    if (!value) {
      return undefined;
    }

    const normalized = this.normalizeEnumToken(value);
    switch (normalized) {
      case 'MICROPATTERN':
        return Pattern.MICRO_PATTERN;
      case 'MICROPLAID':
        return Pattern.MICRO_PLAID;
      default:
        if (normalized in Pattern) {
          return Pattern[normalized as keyof typeof Pattern];
        }
        return undefined;
    }
  }

  private toStatus(value: string | null | undefined): ShinyStatus {
    const normalized = this.normalizeEnumToken(value ?? '');
    if (normalized in ShinyStatus) {
      return ShinyStatus[normalized as keyof typeof ShinyStatus];
    }
    return ShinyStatus.OWNED;
  }
}
