import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

import { Shiny } from '../../../../core/models/shiny.model';
import { EnumLabelPipe } from '../../../../core/pipes/enum-label.pipe';
import { getShinyColorPresentation } from '../shiny-color-presentation.util';

@Component({
  selector: 'app-hoard-inventory-grid',
  standalone: true,
  imports: [
    CommonModule,
    MatSortModule,
    MatTableModule,
    MatTooltipModule,
    MatChipsModule,
    MatMenuModule,
    MatButtonModule,
    EnumLabelPipe,
  ],
  templateUrl: './hoard-inventory-grid.component.html',
  styleUrl: './hoard-inventory-grid.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HoardInventoryGridComponent {
  @Input({ required: true }) shinies: Shiny[] = [];

  @Output() sortChanged = new EventEmitter<Sort>();
  @Output() viewRequested = new EventEmitter<Shiny>();
  @Output() editRequested = new EventEmitter<Shiny>();
  @Output() deleteRequested = new EventEmitter<Shiny>();

  readonly displayedColumns: string[] = [
    'image',
    'name',
    'category',
    'subcategory',
    'context',
    'color',
    'status',
    'notes',
    'actions',
  ];

  getColorPresentation = getShinyColorPresentation;

  onSortChange(sort: Sort): void {
    this.sortChanged.emit(sort);
  }

  openDetail(shiny: Shiny): void {
    this.viewRequested.emit(shiny);
  }

  editShiny(shiny: Shiny): void {
    this.editRequested.emit(shiny);
  }

  deleteShiny(shiny: Shiny): void {
    this.deleteRequested.emit(shiny);
  }
}
