import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';

import { Shiny } from '../../../../core/models/shiny.model';
import { EnumLabelPipe } from '../../../../core/pipes/enum-label.pipe';

type DetailEntry = { label: string; value: string };
type ColorPresentation = {
  swatch: string;
  displayLabel: string;
};

@Component({
  selector: 'app-shiny-detail-modal',
  standalone: true,
  imports: [CommonModule, MatChipsModule, EnumLabelPipe],
  templateUrl: './shiny-detail-modal.component.html',
  styleUrl: './shiny-detail-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShinyDetailModalComponent {
  @Input({ required: true }) shiny: Shiny | null = null;
  @Input({ required: true }) selectedImagePath: string | null = null;
  @Input({ required: true }) selectedImageAlt = '';
  @Input({ required: true }) modalTitle = '';
  @Input({ required: true }) detailEntries: DetailEntry[] = [];
  @Input({ required: true }) deleteErrorMessage: string | null = null;
  @Input({ required: true }) isDeletingShiny = false;
  @Input({ required: true }) colorPresentation: ColorPresentation = {
    swatch: '#7f7f7f',
    displayLabel: 'Unknown',
  };

  @Output() closed = new EventEmitter<void>();
  @Output() editRequested = new EventEmitter<void>();
  @Output() deleteRequested = new EventEmitter<void>();

  closeModal(): void {
    this.closed.emit();
  }

  requestEdit(): void {
    this.editRequested.emit();
  }

  requestDelete(): void {
    this.deleteRequested.emit();
  }

  trackByEntryLabel(_: number, entry: DetailEntry): string {
    return entry.label;
  }

}
