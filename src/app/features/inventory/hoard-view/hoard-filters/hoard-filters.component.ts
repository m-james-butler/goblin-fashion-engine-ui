import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EnumLabelPipe } from '../../../../core/pipes/enum-label.pipe';
import { FilterKey, HoardFilters } from '../hoard-filters.model';

@Component({
  selector: 'app-hoard-filters',
  standalone: true,
  imports: [CommonModule, EnumLabelPipe],
  templateUrl: './hoard-filters.component.html',
  styleUrl: './hoard-filters.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HoardFiltersComponent {
  @Input({ required: true }) filters!: HoardFilters;
  @Input({ required: true }) categoryOptions: string[] = [];
  @Input({ required: true }) contextOptions: string[] = [];
  @Input({ required: true }) statusOptions: string[] = [];
  @Input({ required: true }) colorOptions: string[] = [];
  @Input() searchQuery = '';

  @Output() filterChanged = new EventEmitter<{ filter: FilterKey; value: string }>();
  @Output() searchQueryChanged = new EventEmitter<string>();

  onFilterChange(filter: FilterKey, event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.filterChanged.emit({ filter, value: target.value });
  }

  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQueryChanged.emit(target.value);
  }
}
