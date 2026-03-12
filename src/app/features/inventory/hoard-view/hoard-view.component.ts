import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

import { HoardService } from '../../../core/api/hoard.service';
import { Shiny } from '../../../core/models/shiny.model';

type FilterKey = 'category' | 'context' | 'status' | 'color';
type SortKey = '' | 'category' | 'context' | 'status' | 'color';

@Component({
  selector: 'app-hoard-view',
  standalone: true,
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
  shinies: Shiny[] = [];
  filteredShinies: Shiny[] = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;
  selectedImagePath: string | null = null;
  selectedImageAlt: string = '';
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
  displayedColumns: string[] = [
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

  constructor(private readonly hoardService: HoardService) {
    //intentionally left blank
  }
  ngOnInit(): void {
    this.loadShinies();
  }

  private loadShinies(): void {
    this.hoardService.getShiniesForCurrentHoard().subscribe({
      next: (data) => {
        this.shinies = data;
        this.resetFilters();
        this.buildFilterOptions();
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load shinies. Please try again later.';
        console.error('Error fetching shinies:', error);
        this.isLoading = false;
      },
    });
  }

  onFilterChange(filter: FilterKey, event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.filters[filter] = target.value;
    this.applyFilters();
  }

  onSortChange(sort: Sort): void {
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
        !this.filters.context || shiny.primaryContext === this.filters.context;
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
      category: (shiny) => shiny.category,
      context: (shiny) => shiny.primaryContext,
      status: (shiny) => shiny.status,
      color: (shiny) => shiny.colorPrimary,
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
    this.categoryOptions = this.getUniqueValues((shiny) => shiny.category);
    this.contextOptions = this.getUniqueValues((shiny) => shiny.primaryContext);
    this.statusOptions = this.getUniqueValues((shiny) => shiny.status);
    this.colorOptions = this.getUniqueValues((shiny) => shiny.colorPrimary);
  }

  private getUniqueValues(selector: (shiny: Shiny) => string): string[] {
    return [...new Set(this.shinies.map(selector).filter(Boolean))].sort();
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
