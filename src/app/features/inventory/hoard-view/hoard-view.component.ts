import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  OnInit,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';

import { HoardService } from '../../../core/api/hoard.service';
import { Shiny } from '../../../core/models/shiny.model';
import { AppLoggerService } from '../../../core/logging/app-logger.service';
import { Color } from '../../../core/models/enums';
import { EnumLabelPipe } from '../../../core/pipes/enum-label.pipe';
import { formatEnumLabel } from '../../../core/utils/enum-label.util';

type FilterKey = 'category' | 'context' | 'status' | 'color';
type SortKey = '' | 'category' | 'context' | 'status' | 'color';
type DetailEntry = { label: string; value: string };
type ColorPresentation = {
  swatch: string;
  displayLabel: string;
};

@Component({
  selector: 'app-hoard-view',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatSortModule,
    MatTableModule,
    MatTooltipModule,
    MatChipsModule,
    EnumLabelPipe,
  ],
  templateUrl: './hoard-view.component.html',
  styleUrl: './hoard-view.component.scss',
})
export class HoardViewComponent implements OnInit {
  private readonly hoardService = inject(HoardService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly logger = inject(AppLoggerService);

  shinies: Shiny[] = [];
  filteredShinies: Shiny[] = [];
  isLoading = true;
  errorMessage: string | null = null;
  selectedImagePath: string | null = null;
  selectedImageAlt = '';
  selectedShiny: Shiny | null = null;
  sortState: Sort = { active: '', direction: '' };
  filters: Record<FilterKey, string> = {
    category: '',
    context: '',
    status: '',
    color: '',
  };
  categoryOptions: string[] = [];
  contextOptions: string[] = [];
  statusOptions: string[] = [];
  colorOptions: string[] = [];
  readonly displayedColumns: string[] = [
    'image',
    'name',
    'category',
    'subcategory',
    'context',
    'color',
    'status',
    'notes',
  ];

  ngOnInit(): void {
    this.loadShinies();
  }

  private loadShinies(): void {
    this.hoardService
      .getShiniesForCurrentHoard()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (shinies) => {
          this.logger.info('hoard.view.load.succeeded', { shinyCount: shinies.length });
          this.errorMessage = null;
          this.shinies = shinies;
          this.resetFilters();
          this.buildFilterOptions();
          this.applyFilters();
          this.isLoading = false;
          this.changeDetectorRef.markForCheck();
        },
        error: (error) => {
          this.errorMessage = 'Failed to load shinies. Please try again later.';
          this.logger.error('hoard.view.load.failed', { error });
          this.isLoading = false;
          this.changeDetectorRef.markForCheck();
        },
      });
  }

  applyFilterSelection(filter: FilterKey, event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.filters[filter] = target.value;
    this.applyFilters();
  }

  applySortOrder(sort: Sort): void {
    this.sortState = sort;
    this.applyFilters();
  }

  openDetailModal(shiny: Shiny): void {
    this.selectedShiny = shiny;
    this.selectedImagePath = shiny.imagePath ?? null;
    this.selectedImageAlt = shiny.name || shiny.id;
  }

  closeImageModal(): void {
    this.selectedShiny = null;
    this.selectedImagePath = null;
    this.selectedImageAlt = '';
  }

  getModalTitle(shiny: Shiny | null): string {
    if (!shiny) {
      return '';
    }

    if (shiny.name && shiny.name !== shiny.id) {
      return `${shiny.name} (${shiny.id})`;
    }
    return shiny.id;
  }

  getDetailEntries(shiny: Shiny | null): DetailEntry[] {
    if (!shiny) {
      return [];
    }

    return [
      { label: 'Count', value: shiny.count.toString() },
      { label: 'Layer', value: formatEnumLabel(shiny.layer) },
      {
        label: 'Contexts',
        value: this.toDisplayValue(
          shiny.contexts.map((context) => formatEnumLabel(context)).join(', '),
        ),
      },
      { label: 'Formality', value: formatEnumLabel(shiny.formality) },
      { label: 'Attention', value: formatEnumLabel(shiny.attention) },
      {
        label: 'Secondary Colour',
        value: shiny.colorSecondary ? formatEnumLabel(shiny.colorSecondary) : '-',
      },
      {
        label: 'Pattern',
        value: shiny.pattern ? formatEnumLabel(shiny.pattern) : '-',
      },
      { label: 'Fabric', value: this.toDisplayValue(shiny.fabric) },
      { label: 'Fit', value: this.toDisplayValue(shiny.fit) },
      { label: 'Warmth', value: this.toDisplayValue(shiny.warmth) },
      {
        label: 'Engine Policy',
        value: formatEnumLabel(shiny.engineInclusionPolicy),
      },
      { label: 'Created At', value: this.toDisplayValue(shiny.createdAt) },
      { label: 'Updated At', value: this.toDisplayValue(shiny.updatedAt) },
    ];
  }

  private applyFilters(): void {
    const filtered = this.shinies.filter((shiny) => {
      const matchesCategory =
        !this.filters.category || shiny.category === this.filters.category;
      const matchesContext =
        !this.filters.context ||
        shiny.contexts.some((context) => context === this.filters.context);
      const matchesStatus =
        !this.filters.status || shiny.status === this.filters.status;
      const matchesColor =
        !this.filters.color || shiny.colorPrimary === this.filters.color;

      return (
        matchesCategory && matchesContext && matchesStatus && matchesColor
      );
    });

    this.filteredShinies = this.sortShinies(filtered);
  }

  private sortShinies(shinies: Shiny[]): Shiny[] {
    const active = this.sortState.active as SortKey;
    const direction = this.sortState.direction;

    if (!active || !direction) {
      return shinies;
    }

    const accessor: Record<Exclude<SortKey, ''>, (shiny: Shiny) => string> = {
      category: (shiny) => shiny.category.toString(),
      context: (shiny) => this.getPrimaryContext(shiny),
      status: (shiny) => shiny.status.toString(),
      color: (shiny) => shiny.colorPrimary.toString(),
    };

    const selectValue = accessor[active];
    const sorted = [...shinies].sort((a, b) =>
      selectValue(a).localeCompare(selectValue(b), undefined, {
        sensitivity: 'base',
      })
    );

    return direction === 'asc' ? sorted : sorted.reverse();
  }

  private buildFilterOptions(): void {
    this.categoryOptions = this.getUniqueValues((shiny) =>
      shiny.category.toString(),
    );
    this.contextOptions = this.getUniqueValues((shiny) =>
      this.getPrimaryContext(shiny),
    );
    this.statusOptions = this.getUniqueValues((shiny) => shiny.status.toString());
    this.colorOptions = this.getUniqueValues((shiny) =>
      shiny.colorPrimary.toString(),
    );
  }

  private getUniqueValues(selector: (shiny: Shiny) => string): string[] {
    return [...new Set(this.shinies.map(selector).filter(Boolean))].sort();
  }

  private getPrimaryContext(shiny: Shiny): string {
    return shiny.contexts[0] ?? '';
  }

  private toDisplayValue(value: unknown): string {
    if (value === null || value === undefined || value === '') {
      return '-';
    }
    return String(value);
  }

  private resetFilters(): void {
    this.filters = {
      category: '',
      context: '',
      status: '',
      color: '',
    };
  }

  getColorPresentation(color: Color | undefined): ColorPresentation {
    if (!color) {
      return {
        swatch: '#7f7f7f',
        displayLabel: 'Unknown',
      };
    }

    const baseColor = COLOR_SWATCH_BY_ENUM[color] ?? '#7f7f7f';

    return {
      swatch: baseColor,
      displayLabel: formatEnumLabel(color),
    };
  }
}

const COLOR_SWATCH_BY_ENUM: Record<Color, string> = {
  [Color.BLACK]: '#111111',
  [Color.CHARCOAL]: '#36454f',
  [Color.GREY]: '#808080',
  [Color.WHITE]: '#f7f7f7',
  [Color.CREAM]: '#fff7d1',
  [Color.BEIGE]: '#d9c4a1',
  [Color.TAN]: '#c79b6d',
  [Color.BROWN]: '#7b4f28',
  [Color.NAVY]: '#1f2f5d',
  [Color.BLUE]: '#2f5ee5',
  [Color.LIGHT_BLUE]: '#8cc8ff',
  [Color.DARK_INDIGO]: '#2d2b55',
  [Color.GREEN]: '#2e8b57',
  [Color.OLIVE]: '#6b7b2b',
  [Color.BURGUNDY]: '#7d1e3f',
  [Color.RED]: '#c62828',
  [Color.PINK]: '#e98ab7',
  [Color.PURPLE]: '#6a4c93',
  [Color.YELLOW]: '#f2c94c',
  [Color.ORANGE]: '#f08c2b',
  [Color.MULTI]:
    'linear-gradient(135deg,#f94144 0%,#f3722c 20%,#f9c74f 40%,#90be6d 60%,#577590 80%,#9b5de5 100%)',
  [Color.SILVER]: '#b8b8b8',
  [Color.GOLD]: '#cfae34',
  [Color.KHAKI]: '#9f9657',
  [Color.RUST]: '#b14d1b',
  [Color.DARK_TEAL]: '#0f5c63',
};
