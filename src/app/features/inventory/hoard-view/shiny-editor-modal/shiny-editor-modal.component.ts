import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

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
} from '../../../../core/models/enums';
import { EnumLabelPipe } from '../../../../core/pipes/enum-label.pipe';
import { ShinyFormModel } from '../shiny-form.model';

@Component({
  selector: 'app-shiny-editor-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, EnumLabelPipe],
  templateUrl: './shiny-editor-modal.component.html',
  styleUrl: './shiny-editor-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShinyEditorModalComponent {
  @Input({ required: true }) isOpen = false;
  @Input({ required: true }) title = 'Shiny Editor';
  @Input({ required: true }) submitLabel = 'Save';
  @Input({ required: true }) closeAriaLabel = 'Close shiny editor modal';
  @Input({ required: true }) isSubmitting = false;
  @Input({ required: true }) errorMessage: string | null = null;
  @Input({ required: true }) fieldIdPrefix = 'shiny';
  @Input({ required: true }) form!: ShinyFormModel;

  @Input({ required: true }) categoryValues: ShinyCategory[] = [];
  @Input({ required: true }) layerValues: Layer[] = [];
  @Input({ required: true }) contextValues: Context[] = [];
  @Input({ required: true }) formalityValues: Formality[] = [];
  @Input({ required: true }) attentionValues: Attention[] = [];
  @Input({ required: true }) colorValues: Color[] = [];
  @Input({ required: true }) patternValues: Pattern[] = [];
  @Input({ required: true }) engineInclusionPolicyValues: EngineInclusionPolicy[] = [];
  @Input({ required: true }) statusValues: ShinyStatus[] = [];

  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  isContextSelected(context: Context): boolean {
    return this.form.contexts.includes(context);
  }

  toggleContextSelection(context: Context, event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.checked) {
      if (!this.form.contexts.includes(context)) {
        this.form.contexts = [...this.form.contexts, context];
      }
      return;
    }

    this.form.contexts = this.form.contexts.filter((selected) => selected !== context);
  }

  closeModal(): void {
    this.closed.emit();
  }

  submit(formRef: NgForm): void {
    if (formRef.invalid || this.isSubmitting) {
      return;
    }

    this.saved.emit();
  }

  fieldId(name: string): string {
    return `${this.fieldIdPrefix}-${name}`;
  }
}
