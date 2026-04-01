import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Sort } from '@angular/material/sort';
import { of, Subject, throwError } from 'rxjs';

import { HoardViewComponent } from './hoard-view.component';
import { HoardService } from '../../../core/api/hoard.service';
import { Shiny } from '../../../core/models/shiny.model';
import {
  Attention,
  Color,
  Context,
  EngineInclusionPolicy,
  Formality,
  Layer,
  ShinyCategory,
  ShinyStatus,
} from '../../../core/models/enums';
import { ShinyCreateRequestDto } from '../../../core/api/dto/shiny-create-request.dto';
import { ShinyUpdateRequestDto } from '../../../core/api/dto/shiny-update-request.dto';
import { ShinyPatchRequestDto } from '../../../core/api/dto/shiny-patch-request.dto';

describe('HoardViewComponent', () => {
  let component: HoardViewComponent;
  let fixture: ComponentFixture<HoardViewComponent>;
  let hoardServiceSpy: jasmine.SpyObj<HoardService>;

  const createShiny = (overrides: Partial<Shiny> = {}): Shiny => ({
    id: 'shiny-001',
    goblinId: 'GBL-001',
    hoardId: 'HRD-001',
    name: 'Ring',
    count: 1,
    category: ShinyCategory.ACCESSORY,
    subcategory: 'Ring',
    layer: Layer.ACCESSORY,
    contexts: [Context.CASUAL],
    formality: Formality.CASUAL,
    attention: Attention.LOW,
    colorPrimary: Color.GOLD,
    officeOk: false,
    publicWear: true,
    includeInEngine: true,
    engineInclusionPolicy: EngineInclusionPolicy.NORMAL,
    status: ShinyStatus.OWNED,
    ...overrides,
  });

  beforeEach(async () => {
    hoardServiceSpy = jasmine.createSpyObj<HoardService>('HoardService', [
      'getShiniesForCurrentHoard',
      'createShinyForCurrentHoard',
      'updateShinyForCurrentHoard',
      'patchShinyForCurrentHoard',
      'deleteShinyForCurrentHoard',
    ]);
    hoardServiceSpy.createShinyForCurrentHoard.and.returnValue(
      of(
        createShiny({
          id: 'created-1',
          name: 'Created Shiny',
        }),
      ),
    );
    hoardServiceSpy.deleteShinyForCurrentHoard.and.returnValue(of(void 0));
    hoardServiceSpy.updateShinyForCurrentHoard.and.returnValue(
      of(
        createShiny({
          id: 'shiny-001',
          name: 'Updated Shiny',
        }),
      ),
    );
    hoardServiceSpy.patchShinyForCurrentHoard.and.returnValue(
      of(
        createShiny({
          id: 'shiny-001',
          status: ShinyStatus.DONATE,
        }),
      ),
    );

    await TestBed.configureTestingModule({
      imports: [HoardViewComponent],
      providers: [{ provide: HoardService, useValue: hoardServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(HoardViewComponent);
    component = fixture.componentInstance;
  });

  it('shows loading state while data stream is pending', () => {
    const stream = new Subject<Shiny[]>();
    hoardServiceSpy.getShiniesForCurrentHoard.and.returnValue(stream.asObservable());

    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.textContent).toContain('Loading shinies...');
  });

  it('shows empty message when no shinies are returned', () => {
    hoardServiceSpy.getShiniesForCurrentHoard.and.returnValue(of([]));

    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.textContent).toContain('No shinies found in the current hoard.');
  });

  it('shows error state when data retrieval fails', () => {
    hoardServiceSpy.getShiniesForCurrentHoard.and.returnValue(
      throwError(() => new Error('boom')),
    );

    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.textContent).toContain('Hoard unavailable');
    expect(host.textContent).toContain('Failed to load shinies. Please try again later.');
  });

  it('filters rows by category', () => {
    hoardServiceSpy.getShiniesForCurrentHoard.and.returnValue(
      of([
        createShiny({ id: 'a1', category: ShinyCategory.ACCESSORY, notes: 'belt' }),
        createShiny({ id: 't1', category: ShinyCategory.TOP, notes: 'tee' }),
      ]),
    );

    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const select = host.querySelector('#category-filter') as HTMLSelectElement;
    select.value = ShinyCategory.TOP;
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const rows = host.querySelectorAll('tr.mat-mdc-row');
    expect(rows.length).toBe(1);
    expect(host.textContent).toContain('tee');
    expect(host.textContent).not.toContain('belt');
  });

  it('filters rows by context from contexts[]', () => {
    hoardServiceSpy.getShiniesForCurrentHoard.and.returnValue(
      of([
        createShiny({ id: 'c1', contexts: [Context.CASUAL], notes: 'casual item' }),
        createShiny({ id: 'o1', contexts: [Context.OFFICE], notes: 'office item' }),
      ]),
    );

    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const select = host.querySelector('#context-filter') as HTMLSelectElement;
    select.value = Context.OFFICE;
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const rows = host.querySelectorAll('tr.mat-mdc-row');
    expect(rows.length).toBe(1);
    expect(host.textContent).toContain('office item');
    expect(host.textContent).not.toContain('casual item');
  });

  it('filters rows by search query', () => {
    hoardServiceSpy.getShiniesForCurrentHoard.and.returnValue(
      of([
        createShiny({ id: 's1', name: 'Emerald Cloak', notes: 'green layer' }),
        createShiny({ id: 's2', name: 'Iron Boots', notes: 'heavy step' }),
      ]),
    );

    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const searchInput = host.querySelector('#shiny-search-filter') as HTMLInputElement;
    searchInput.value = 'emerald';
    searchInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const rows = host.querySelectorAll('tr.mat-mdc-row');
    expect(rows.length).toBe(1);
    expect(host.textContent).toContain('Emerald Cloak');
    expect(host.textContent).not.toContain('Iron Boots');
  });

  it('sorts rows by color', () => {
    hoardServiceSpy.getShiniesForCurrentHoard.and.returnValue(
      of([
        createShiny({ id: 'n1', colorPrimary: Color.NAVY }),
        createShiny({ id: 'b1', colorPrimary: Color.BLACK }),
      ]),
    );

    fixture.detectChanges();

    component.applySortOrder({ active: 'color', direction: 'asc' } as Sort);

    expect(component.filteredShinies.map((shiny) => shiny.colorPrimary)).toEqual([
      Color.BLACK,
      Color.NAVY,
    ]);
  });

  it('opens image modal when shiny has imagePath', () => {
    hoardServiceSpy.getShiniesForCurrentHoard.and.returnValue(
      of([
        createShiny({
          id: 'img1',
          imagePath: '/resources/images/shiny-1.png',
          name: 'Preview Shiny',
        }),
      ]),
    );

    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const thumb = host.querySelector('.image-button') as HTMLButtonElement;
    thumb.click();
    fixture.detectChanges();

    const modal = host.querySelector('.image-modal');
    const modalImage = host.querySelector('.image-modal img') as HTMLImageElement;

    expect(modal).toBeTruthy();
    expect(modalImage.src).toContain('/resources/images/shiny-1.png');
  });

  it('opens detail modal when shiny name is clicked', () => {
    hoardServiceSpy.getShiniesForCurrentHoard.and.returnValue(
      of([
        createShiny({
          id: 'name1',
          imagePath: undefined,
          name: 'Named Shiny',
        }),
      ]),
    );

    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const nameButton = host.querySelector('.name-button') as HTMLButtonElement;
    nameButton.click();
    fixture.detectChanges();

    const modal = host.querySelector('.image-modal');
    expect(modal).toBeTruthy();
    expect(host.textContent).toContain('Named Shiny');
  });

  it('renders fallback icon when imagePath is missing', () => {
    hoardServiceSpy.getShiniesForCurrentHoard.and.returnValue(
      of([createShiny({ id: 'no-image' })]),
    );

    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const icon = host.querySelector('.image-fallback-icon');
    expect(icon).toBeTruthy();
    expect(icon?.classList.contains('fa-image')).toBeTrue();
  });

  it('opens add shiny modal from add button', () => {
    hoardServiceSpy.getShiniesForCurrentHoard.and.returnValue(of([createShiny()]));

    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const addButton = host.querySelector('.add-shiny-button') as HTMLButtonElement;
    addButton.click();
    fixture.detectChanges();

    expect(host.querySelector('.add-shiny-modal')).toBeTruthy();
    expect(host.textContent).toContain('Add Shiny');
  });

  it('submits a new shiny from modal form', () => {
    hoardServiceSpy.getShiniesForCurrentHoard.and.returnValue(of([createShiny()]));

    fixture.detectChanges();
    component.openAddShinyModal();

    component.newShinyForm = {
      ...component.newShinyForm,
      name: 'New Submission',
      contexts: [Context.CASUAL, Context.OFFICE],
      category: ShinyCategory.TOP,
      layer: Layer.BASE,
      formality: Formality.CASUAL,
      attention: Attention.MEDIUM,
      colorPrimary: Color.BLACK,
      engineInclusionPolicy: EngineInclusionPolicy.NORMAL,
      status: ShinyStatus.OWNED,
    };

    const created = createShiny({
      id: 'created-2',
      name: 'New Submission',
    });
    hoardServiceSpy.createShinyForCurrentHoard.and.returnValue(of(created));

    component.submitNewShiny();

    expect(hoardServiceSpy.createShinyForCurrentHoard).toHaveBeenCalled();
    const submittedPayload = hoardServiceSpy.createShinyForCurrentHoard.calls.mostRecent()
      .args[0] as ShinyCreateRequestDto;
    expect(submittedPayload.id).toBeTruthy();
    expect(submittedPayload.name).toBe('New Submission');
    expect(submittedPayload.contexts).toEqual([Context.CASUAL, Context.OFFICE]);
    expect(component.shinies[0].id).toBe('created-2');
    expect(component.isAddModalOpen).toBeFalse();
  });

  it('deletes selected shiny from detail modal after confirmation', () => {
    const shinyToDelete = createShiny({ id: 'delete-me', name: 'Delete Me' });
    hoardServiceSpy.getShiniesForCurrentHoard.and.returnValue(of([shinyToDelete]));
    hoardServiceSpy.deleteShinyForCurrentHoard.and.returnValue(of(void 0));
    spyOn(window, 'confirm').and.returnValue(true);

    fixture.detectChanges();
    component.openDetailModal(shinyToDelete);

    component.deleteSelectedShiny();

    expect(hoardServiceSpy.deleteShinyForCurrentHoard).toHaveBeenCalledOnceWith('delete-me');
    expect(component.shinies.find((shiny) => shiny.id === 'delete-me')).toBeUndefined();
    expect(component.selectedShiny).toBeNull();
  });

  it('updates a shiny from edit modal', () => {
    const shinyToEdit = createShiny({ id: 'edit-me', name: 'Before Edit' });
    hoardServiceSpy.getShiniesForCurrentHoard.and.returnValue(of([shinyToEdit]));
    hoardServiceSpy.updateShinyForCurrentHoard.and.returnValue(
      of(
        createShiny({
          id: 'edit-me',
          name: 'After Edit',
          contexts: [Context.OFFICE],
        }),
      ),
    );

    fixture.detectChanges();
    component.openEditShinyModal(shinyToEdit);
    component.editShinyForm = {
      ...component.editShinyForm,
      name: 'After Edit',
      contexts: [Context.OFFICE],
      category: ShinyCategory.TOP,
      layer: Layer.BASE,
      formality: Formality.CASUAL,
      attention: Attention.LOW,
      colorPrimary: Color.BLACK,
      engineInclusionPolicy: EngineInclusionPolicy.NORMAL,
      status: ShinyStatus.OWNED,
    };

    component.submitEditedShiny();

    expect(hoardServiceSpy.updateShinyForCurrentHoard).toHaveBeenCalled();
    const [shinyId, payload] = hoardServiceSpy.updateShinyForCurrentHoard.calls.mostRecent()
      .args as [string, ShinyUpdateRequestDto];
    expect(shinyId).toBe('edit-me');
    expect(payload.id).toBe('edit-me');
    expect(payload.name).toBe('After Edit');
    expect(component.shinies[0].name).toBe('After Edit');
    expect(component.isEditModalOpen).toBeFalse();
  });

  it('uses patch endpoint when edit changes patch-only fields', () => {
    const shinyToEdit = createShiny({
      id: 'patch-me',
      name: 'Patchable',
      notes: 'before',
      includeInEngine: true,
      attention: Attention.LOW,
      status: ShinyStatus.OWNED,
    });
    hoardServiceSpy.getShiniesForCurrentHoard.and.returnValue(of([shinyToEdit]));
    hoardServiceSpy.patchShinyForCurrentHoard.and.returnValue(
      of(
        createShiny({
          id: 'patch-me',
          name: 'Patchable',
          notes: 'after',
          includeInEngine: false,
          attention: Attention.MEDIUM,
          status: ShinyStatus.DONATE,
        }),
      ),
    );

    fixture.detectChanges();
    component.openEditShinyModal(shinyToEdit);
    component.editShinyForm = {
      ...component.editShinyForm,
      notes: 'after',
      includeInEngine: false,
      attention: Attention.MEDIUM,
      status: ShinyStatus.DONATE,
    };

    component.submitEditedShiny();

    expect(hoardServiceSpy.patchShinyForCurrentHoard).toHaveBeenCalled();
    const [shinyId, payload] = hoardServiceSpy.patchShinyForCurrentHoard.calls.mostRecent()
      .args as [string, ShinyPatchRequestDto];
    expect(shinyId).toBe('patch-me');
    expect(payload).toEqual(
      jasmine.objectContaining({
        notes: 'after',
        includeInEngine: false,
        attentionLevel: Attention.MEDIUM,
        status: ShinyStatus.DONATE,
      }),
    );
    expect(hoardServiceSpy.updateShinyForCurrentHoard).not.toHaveBeenCalled();
  });
});
