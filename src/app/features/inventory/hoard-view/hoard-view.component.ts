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

import { HoardService } from '../../../core/api/hoard.service';
import { Shiny } from '../../../core/models/shiny.model';
import { AppLoggerService } from '../../../core/logging/app-logger.service';

type FilterKey = 'category' | 'context' | 'status' | 'color';
type SortKey = '' | 'category' | 'context' | 'status' | 'color';

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
    'layer',
    'color',
    'pattern',
    'fabric',
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

  openImageModal(shiny: Shiny): void {
    if (!shiny.imagePath) {
      return;
    }

    this.selectedShiny = shiny;
    this.selectedImagePath = shiny.imagePath;
    this.selectedImageAlt = shiny.filename || shiny.id;
  }

  closeImageModal(): void {
    this.selectedShiny = null;
    this.selectedImagePath = null;
    this.selectedImageAlt = '';
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

  private resetFilters(): void {
    this.filters = {
      category: '',
      context: '',
      status: '',
      color: '',
    };
  }
}
