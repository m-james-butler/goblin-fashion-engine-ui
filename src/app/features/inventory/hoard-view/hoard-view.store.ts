import { Injectable, computed, signal } from '@angular/core';
import { Sort } from '@angular/material/sort';

import { Shiny } from '../../../core/models/shiny.model';
import { FilterKey, HoardFilters } from './hoard-filters.model';

type SortKey = '' | 'category' | 'context' | 'status' | 'color';

@Injectable()
export class HoardViewStore {
  private readonly shiniesSignal = signal<Shiny[]>([]);
  private readonly filtersSignal = signal<HoardFilters>(this.createDefaultFilters());
  private readonly sortStateSignal = signal<Sort>({ active: '', direction: '' });
  private readonly searchQuerySignal = signal('');

  readonly shinies = computed(() => this.shiniesSignal());
  readonly filters = computed(() => this.filtersSignal());
  readonly sortState = computed(() => this.sortStateSignal());
  readonly searchQuery = computed(() => this.searchQuerySignal());

  readonly filteredShinies = computed(() => {
    const currentFilters = this.filtersSignal();
    const currentQuery = this.searchQuerySignal();
    const filtered = this.shiniesSignal().filter((shiny) => {
      const matchesCategory =
        !currentFilters.category || shiny.category === currentFilters.category;
      const matchesContext =
        !currentFilters.context ||
        shiny.contexts.some((context) => context === currentFilters.context);
      const matchesStatus = !currentFilters.status || shiny.status === currentFilters.status;
      const matchesColor =
        !currentFilters.color || shiny.colorPrimary === currentFilters.color;
      const matchesSearch = this.matchesSearchQuery(shiny, currentQuery);

      return (
        matchesCategory && matchesContext && matchesStatus && matchesColor && matchesSearch
      );
    });

    return this.sortShinies(filtered, this.sortStateSignal());
  });

  readonly categoryOptions = computed(() =>
    this.getUniqueValues((shiny) => shiny.category.toString()),
  );
  readonly contextOptions = computed(() =>
    this.getUniqueValues((shiny) => this.getPrimaryContext(shiny)),
  );
  readonly statusOptions = computed(() =>
    this.getUniqueValues((shiny) => shiny.status.toString()),
  );
  readonly colorOptions = computed(() =>
    this.getUniqueValues((shiny) => shiny.colorPrimary.toString()),
  );

  replaceAllShinies(shinies: Shiny[]): void {
    this.shiniesSignal.set(shinies);
    this.filtersSignal.set(this.createDefaultFilters());
    this.searchQuerySignal.set('');
    this.sortStateSignal.set({ active: '', direction: '' });
  }

  prependShiny(shiny: Shiny): void {
    this.shiniesSignal.update((shinies) => [shiny, ...shinies]);
  }

  replaceShiny(shiny: Shiny): void {
    this.shiniesSignal.update((shinies) =>
      shinies.map((candidate) => (candidate.id === shiny.id ? shiny : candidate)),
    );
  }

  removeShiny(shinyId: string): void {
    this.shiniesSignal.update((shinies) =>
      shinies.filter((candidate) => candidate.id !== shinyId),
    );
  }

  updateFilter(filter: FilterKey, value: string): void {
    this.filtersSignal.update((filters) => ({
      ...filters,
      [filter]: value,
    }));
  }

  updateSearchQuery(value: string): void {
    this.searchQuerySignal.set(value);
  }

  updateSort(sort: Sort): void {
    this.sortStateSignal.set(sort);
  }

  getShinyById(shinyId: string): Shiny | undefined {
    return this.shiniesSignal().find((shiny) => shiny.id === shinyId);
  }

  private getUniqueValues(selector: (shiny: Shiny) => string): string[] {
    return [...new Set(this.shiniesSignal().map(selector).filter(Boolean))].sort();
  }

  private getPrimaryContext(shiny: Shiny): string {
    return shiny.contexts[0] ?? '';
  }

  private matchesSearchQuery(shiny: Shiny, query: string): boolean {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return true;
    }

    const searchableFields = [
      shiny.id,
      shiny.name ?? '',
      shiny.notes ?? '',
      shiny.subcategory ?? '',
      shiny.fabric ?? '',
      shiny.fit ?? '',
    ]
      .join(' ')
      .toLowerCase();

    return searchableFields.includes(normalizedQuery);
  }

  private sortShinies(shinies: Shiny[], sort: Sort): Shiny[] {
    const active = sort.active as SortKey;
    const direction = sort.direction;

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
      }),
    );

    return direction === 'asc' ? sorted : sorted.reverse();
  }

  private createDefaultFilters(): HoardFilters {
    return {
      category: '',
      context: '',
      status: '',
      color: '',
    };
  }
}
