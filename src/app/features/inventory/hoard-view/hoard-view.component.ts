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
import { Sort } from '@angular/material/sort';
import { Observable } from 'rxjs';

import { HoardService } from '../../../core/api/hoard.service';
import { Shiny } from '../../../core/models/shiny.model';
import { AppLoggerService } from '../../../core/logging/app-logger.service';
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
  enumValues,
} from '../../../core/models/enums';
import { formatEnumLabel } from '../../../core/utils/enum-label.util';
import { ShinyCreateRequestDto } from '../../../core/api/dto/shiny-create-request.dto';
import { ShinyUpdateRequestDto } from '../../../core/api/dto/shiny-update-request.dto';
import { ShinyPatchRequestDto } from '../../../core/api/dto/shiny-patch-request.dto';
import { ShinyEditorModalComponent } from './shiny-editor-modal/shiny-editor-modal.component';
import { ShinyFormModel } from './shiny-form.model';
import { ShinyDetailModalComponent } from './shiny-detail-modal/shiny-detail-modal.component';
import { HoardFiltersComponent } from './hoard-filters/hoard-filters.component';
import { HoardInventoryGridComponent } from './hoard-inventory-grid/hoard-inventory-grid.component';
import { FilterKey, HoardFilters } from './hoard-filters.model';
import {
  ColorPresentation,
  getShinyColorPresentation,
} from './shiny-color-presentation.util';
import { HoardViewStore } from './hoard-view.store';

type DetailEntry = { label: string; value: string };
type EditSubmissionMode =
  | { kind: 'none' }
  | { kind: 'patch'; payload: ShinyPatchRequestDto }
  | { kind: 'put'; payload: ShinyUpdateRequestDto };

@Component({
  selector: 'app-hoard-view',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [HoardViewStore],
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    ShinyEditorModalComponent,
    ShinyDetailModalComponent,
    HoardFiltersComponent,
    HoardInventoryGridComponent,
  ],
  templateUrl: './hoard-view.component.html',
  styleUrl: './hoard-view.component.scss',
})
export class HoardViewComponent implements OnInit {
  private readonly hoardService = inject(HoardService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly logger = inject(AppLoggerService);
  private readonly viewStore = inject(HoardViewStore);

  isLoading = true;
  errorMessage: string | null = null;
  addErrorMessage: string | null = null;
  editErrorMessage: string | null = null;
  deleteErrorMessage: string | null = null;
  selectedImagePath: string | null = null;
  selectedImageAlt = '';
  selectedShiny: Shiny | null = null;
  isDeletingShiny = false;
  isAddModalOpen = false;
  isEditModalOpen = false;
  isSubmittingNewShiny = false;
  isSubmittingEditShiny = false;
  newShinyForm: ShinyFormModel = this.createDefaultShinyForm();
  editShinyForm: ShinyFormModel = this.createDefaultShinyForm();
  editingShinyId: string | null = null;
  readonly categoryValues = enumValues(ShinyCategory) as ShinyCategory[];
  readonly layerValues = enumValues(Layer) as Layer[];
  readonly contextValues = enumValues(Context) as Context[];
  readonly formalityValues = enumValues(Formality) as Formality[];
  readonly attentionValues = enumValues(Attention) as Attention[];
  readonly colorValues = enumValues(Color) as Color[];
  readonly patternValues = enumValues(Pattern) as Pattern[];
  readonly engineInclusionPolicyValues = enumValues(
    EngineInclusionPolicy,
  ) as EngineInclusionPolicy[];
  readonly statusValues = enumValues(ShinyStatus) as ShinyStatus[];

  get shinies(): Shiny[] {
    return this.viewStore.shinies();
  }

  get filteredShinies(): Shiny[] {
    return this.viewStore.filteredShinies();
  }

  get sortState(): Sort {
    return this.viewStore.sortState();
  }

  get filters(): HoardFilters {
    return this.viewStore.filters();
  }

  get searchQuery(): string {
    return this.viewStore.searchQuery();
  }

  get categoryOptions(): string[] {
    return this.viewStore.categoryOptions();
  }

  get contextOptions(): string[] {
    return this.viewStore.contextOptions();
  }

  get statusOptions(): string[] {
    return this.viewStore.statusOptions();
  }

  get colorOptions(): string[] {
    return this.viewStore.colorOptions();
  }

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
          this.viewStore.replaceAllShinies(shinies);
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

  applyFilterSelection(filter: FilterKey, value: string): void {
    this.viewStore.updateFilter(filter, value);
  }

  updateSearchQuery(value: string): void {
    this.viewStore.updateSearchQuery(value);
  }

  applySortOrder(sort: Sort): void {
    this.viewStore.updateSort(sort);
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
    this.deleteErrorMessage = null;
    this.isDeletingShiny = false;
  }

  openAddShinyModal(): void {
    this.newShinyForm = this.createDefaultShinyForm();
    this.addErrorMessage = null;
    this.isAddModalOpen = true;
  }

  closeAddShinyModal(): void {
    this.isAddModalOpen = false;
    this.isSubmittingNewShiny = false;
    this.addErrorMessage = null;
  }

  openEditShinyModal(shiny: Shiny): void {
    this.editingShinyId = shiny.id;
    this.editShinyForm = this.createShinyFormFromModel(shiny);
    this.editErrorMessage = null;
    this.isEditModalOpen = true;
  }

  closeEditShinyModal(): void {
    this.isEditModalOpen = false;
    this.isSubmittingEditShiny = false;
    this.editErrorMessage = null;
    this.editingShinyId = null;
  }

  openEditFromDetailModal(): void {
    if (!this.selectedShiny) {
      return;
    }

    const shinyToEdit = this.selectedShiny;
    this.closeImageModal();
    this.openEditShinyModal(shinyToEdit);
  }

  editShinyFromActions(shiny: Shiny): void {
    this.openEditShinyModal(shiny);
  }

  deleteShinyFromActions(shiny: Shiny): void {
    this.deleteShiny(shiny, {
      closeDetailOnSuccess: false,
      reportErrorsInDetailModal: false,
    });
  }

  submitNewShiny(): void {
    if (this.isSubmittingNewShiny) {
      return;
    }

    if (this.newShinyForm.contexts.length === 0) {
      this.addErrorMessage = 'Select at least one context.';
      return;
    }

    this.addErrorMessage = null;
    this.isSubmittingNewShiny = true;

    const payload: ShinyCreateRequestDto = this.buildShinyPayload(
      this.newShinyForm,
      this.createNewShinyId(),
    );

    this.hoardService
      .createShinyForCurrentHoard(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (createdShiny) => {
          this.viewStore.prependShiny(createdShiny);
          this.closeAddShinyModal();
          this.changeDetectorRef.markForCheck();
        },
        error: (error) => {
          this.logger.error('hoard.shiny.create.failed', { error });
          this.addErrorMessage = 'Unable to add shiny right now. Please try again.';
          this.isSubmittingNewShiny = false;
          this.changeDetectorRef.markForCheck();
        },
      });
  }

  submitEditedShiny(): void {
    if (this.isSubmittingEditShiny || !this.editingShinyId) {
      return;
    }

    if (this.editShinyForm.contexts.length === 0) {
      this.editErrorMessage = 'Select at least one context.';
      return;
    }

    const existingShiny = this.viewStore.getShinyById(this.editingShinyId);
    if (!existingShiny) {
      this.editErrorMessage = 'Unable to find shiny to edit.';
      this.logger.error('hoard.shiny.update.skipped.missing-current-shiny', {
        shinyId: this.editingShinyId,
      });
      return;
    }

    const editSubmission = this.buildEditSubmission(
      existingShiny,
      this.editShinyForm,
      this.editingShinyId,
    );
    if (editSubmission.kind === 'none') {
      this.closeEditShinyModal();
      this.changeDetectorRef.markForCheck();
      return;
    }

    this.editErrorMessage = null;
    this.isSubmittingEditShiny = true;

    const saveRequest$ = this.resolveEditRequest(this.editingShinyId, editSubmission);
    saveRequest$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (updatedShiny) => {
        this.viewStore.replaceShiny(updatedShiny);
        this.closeEditShinyModal();
        this.changeDetectorRef.markForCheck();
      },
      error: (error) => {
        this.logger.error('hoard.shiny.update.failed', {
          error,
          shinyId: this.editingShinyId,
          mode: editSubmission.kind,
        });
        this.editErrorMessage = 'Unable to save shiny changes right now. Please try again.';
        this.isSubmittingEditShiny = false;
        this.changeDetectorRef.markForCheck();
      },
    });
  }

  deleteSelectedShiny(): void {
    if (!this.selectedShiny || this.isDeletingShiny) {
      return;
    }

    this.deleteShiny(this.selectedShiny, {
      closeDetailOnSuccess: true,
      reportErrorsInDetailModal: true,
    });
  }

  private deleteShiny(
    shinyToDelete: Shiny,
    options: { closeDetailOnSuccess: boolean; reportErrorsInDetailModal: boolean },
  ): void {
    const shinyLabel = shinyToDelete.name || shinyToDelete.id;
    const shouldDelete = globalThis.confirm(
      `Delete "${shinyLabel}"? This action cannot be undone.`,
    );

    if (!shouldDelete) {
      return;
    }

    this.deleteErrorMessage = null;
    this.isDeletingShiny = true;

    this.hoardService
      .deleteShinyForCurrentHoard(shinyToDelete.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          if (options.closeDetailOnSuccess) {
            this.closeImageModal();
          }
          this.viewStore.removeShiny(shinyToDelete.id);
          this.changeDetectorRef.markForCheck();
        },
        error: (error) => {
          this.logger.error('hoard.shiny.delete.failed', { error, shinyId: shinyToDelete.id });
          if (options.reportErrorsInDetailModal) {
            this.deleteErrorMessage = 'Unable to delete shiny right now. Please try again.';
          }
          this.isDeletingShiny = false;
          this.changeDetectorRef.markForCheck();
        },
      });
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

  private resolveEditRequest(
    shinyId: string,
    editSubmission: Exclude<EditSubmissionMode, { kind: 'none' }>,
  ): Observable<Shiny> {
    if (editSubmission.kind === 'patch') {
      return this.hoardService.patchShinyForCurrentHoard(shinyId, editSubmission.payload);
    }

    return this.hoardService.updateShinyForCurrentHoard(shinyId, editSubmission.payload);
  }

  private buildEditSubmission(
    existingShiny: Shiny,
    form: ShinyFormModel,
    shinyId: string,
  ): EditSubmissionMode {
    const patchPayload = this.buildPatchPayloadWhenApplicable(existingShiny, form);
    if (patchPayload === null) {
      return {
        kind: 'put',
        payload: this.buildShinyPayload(form, shinyId),
      };
    }

    if (Object.keys(patchPayload).length === 0) {
      return { kind: 'none' };
    }

    return {
      kind: 'patch',
      payload: patchPayload,
    };
  }

  private buildPatchPayloadWhenApplicable(
    existingShiny: Shiny,
    form: ShinyFormModel,
  ): ShinyPatchRequestDto | null {
    const nonPatchFieldsChanged =
      this.normalizeText(existingShiny.name) !== this.normalizeText(form.name) ||
      existingShiny.count !== form.count ||
      existingShiny.category !== form.category ||
      this.normalizeText(existingShiny.subcategory) !== this.normalizeText(form.subcategory) ||
      existingShiny.layer !== form.layer ||
      !this.areStringArraysEqual(existingShiny.contexts, form.contexts) ||
      existingShiny.formality !== form.formality ||
      existingShiny.colorPrimary !== form.colorPrimary ||
      this.normalizeEnumValue(existingShiny.colorSecondary) !== form.colorSecondary ||
      this.normalizeEnumValue(existingShiny.pattern) !== form.pattern ||
      this.normalizeText(existingShiny.fabric) !== this.normalizeText(form.fabric) ||
      this.normalizeText(existingShiny.fit) !== this.normalizeText(form.fit) ||
      this.normalizeNumber(existingShiny.warmth) !== this.toOptionalNumber(form.warmth) ||
      existingShiny.officeOk !== form.officeOk ||
      existingShiny.publicWear !== form.publicWear ||
      existingShiny.engineInclusionPolicy !== form.engineInclusionPolicy;

    if (nonPatchFieldsChanged) {
      return null;
    }

    const patchPayload: ShinyPatchRequestDto = {};
    if (existingShiny.status !== form.status) {
      patchPayload.status = form.status;
    }
    if (existingShiny.attention !== form.attention) {
      patchPayload.attentionLevel = form.attention;
    }
    if (existingShiny.includeInEngine !== form.includeInEngine) {
      patchPayload.includeInEngine = form.includeInEngine;
    }

    const normalizedImagePath = form.imagePathPlaceholder.trim();
    const existingImagePath = existingShiny.imagePath ?? '';
    if (normalizedImagePath !== existingImagePath) {
      patchPayload.imagePath = normalizedImagePath;
    }

    const normalizedNotes = form.notes.trim();
    const existingNotes = existingShiny.notes ?? '';
    if (normalizedNotes !== existingNotes) {
      patchPayload.notes = normalizedNotes;
    }

    return patchPayload;
  }

  private areStringArraysEqual(left: readonly string[], right: readonly string[]): boolean {
    if (left.length !== right.length) {
      return false;
    }

    return left.every((value, index) => value === right[index]);
  }

  private normalizeText(value: string | undefined): string {
    return (value ?? '').trim();
  }

  private normalizeEnumValue<T extends string>(value: T | undefined): '' | T {
    return value ?? '';
  }

  private normalizeNumber(value: number | undefined): number | undefined {
    if (value === null || value === undefined) {
      return undefined;
    }

    return Number.isFinite(value) ? value : undefined;
  }

  private toDisplayValue(value: unknown): string {
    if (value === null || value === undefined || value === '') {
      return '-';
    }
    return String(value);
  }

  private toUndefinedIfBlank(value: string): string | undefined {
    const trimmedValue = value.trim();
    return trimmedValue ? trimmedValue : undefined;
  }

  private toOptionalNumber(value: string | number | null | undefined): number | undefined {
    if (value === null || value === undefined) {
      return undefined;
    }

    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : undefined;
    }

    const trimmedValue = value.trim();
    if (!trimmedValue) {
      return undefined;
    }

    const parsedValue = Number(trimmedValue);
    return Number.isFinite(parsedValue) ? parsedValue : undefined;
  }

  private toOptionalEnumValue<T extends string>(value: '' | T): T | undefined {
    return value || undefined;
  }

  private buildShinyPayload(form: ShinyFormModel, id: string): ShinyCreateRequestDto {
    return {
      id,
      name: this.toUndefinedIfBlank(form.name),
      notes: this.toUndefinedIfBlank(form.notes),
      count: form.count,
      category: form.category,
      subcategory: this.toUndefinedIfBlank(form.subcategory),
      layer: form.layer,
      contexts: form.contexts,
      formality: form.formality,
      attention: form.attention,
      colorPrimary: form.colorPrimary,
      colorSecondary: this.toOptionalEnumValue(form.colorSecondary),
      pattern: this.toOptionalEnumValue(form.pattern),
      fabric: this.toUndefinedIfBlank(form.fabric),
      fit: this.toUndefinedIfBlank(form.fit),
      warmth: this.toOptionalNumber(form.warmth),
      officeOk: form.officeOk,
      publicWear: form.publicWear,
      includeInEngine: form.includeInEngine,
      engineInclusionPolicy: form.engineInclusionPolicy,
      imagePath: this.toUndefinedIfBlank(form.imagePathPlaceholder),
      status: form.status,
    };
  }

  private createShinyFormFromModel(shiny: Shiny): ShinyFormModel {
    return {
      name: shiny.name ?? '',
      notes: shiny.notes ?? '',
      count: shiny.count,
      category: shiny.category,
      subcategory: shiny.subcategory ?? '',
      layer: shiny.layer,
      contexts: [...shiny.contexts],
      formality: shiny.formality,
      attention: shiny.attention,
      colorPrimary: shiny.colorPrimary,
      colorSecondary: shiny.colorSecondary ?? '',
      pattern: shiny.pattern ?? '',
      fabric: shiny.fabric ?? '',
      fit: shiny.fit ?? '',
      warmth: shiny.warmth?.toString() ?? '',
      officeOk: shiny.officeOk,
      publicWear: shiny.publicWear,
      includeInEngine: shiny.includeInEngine,
      engineInclusionPolicy: shiny.engineInclusionPolicy,
      imagePathPlaceholder: shiny.imagePath ?? '',
      status: shiny.status,
    };
  }

  private createDefaultShinyForm(): ShinyFormModel {
    return {
      name: '',
      notes: '',
      count: 1,
      category: ShinyCategory.TOP,
      subcategory: '',
      layer: Layer.BASE,
      contexts: [Context.CASUAL],
      formality: Formality.CASUAL,
      attention: Attention.LOW,
      colorPrimary: Color.BLACK,
      colorSecondary: '',
      pattern: '',
      fabric: '',
      fit: '',
      warmth: '',
      officeOk: false,
      publicWear: true,
      includeInEngine: true,
      engineInclusionPolicy: EngineInclusionPolicy.NORMAL,
      imagePathPlaceholder: '',
      status: ShinyStatus.OWNED,
    };
  }

  private createNewShinyId(): string {
    const randomUuid = globalThis.crypto?.randomUUID?.();
    if (randomUuid) {
      return randomUuid;
    }

    return `shiny-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
  }

  getColorPresentation(color: Color | undefined): ColorPresentation {
    return getShinyColorPresentation(color);
  }
}
