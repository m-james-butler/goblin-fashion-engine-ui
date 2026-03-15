import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Sort } from '@angular/material/sort';
import { of, Subject, throwError } from 'rxjs';

import { HoardViewComponent } from './hoard-view.component';
import { HoardService } from '../../../core/api/hoard.service';
import { Shiny } from '../../../core/models/shiny.model';

describe('HoardViewComponent', () => {
  let component: HoardViewComponent;
  let fixture: ComponentFixture<HoardViewComponent>;
  let hoardServiceSpy: jasmine.SpyObj<HoardService>;

  const createShiny = (overrides: Partial<Shiny> = {}): Shiny => ({
    id: 'shiny-001',
    count: 1,
    category: 'accessory',
    subcategory: 'ring',
    filename: '',
    primaryContext: 'adventure',
    secondaryContext: null,
    formality: 'casual',
    warmth: 2,
    layer: 'outer',
    colorPrimary: 'gold',
    colorSecondary: null,
    pattern: null,
    fabric: null,
    fit: null,
    officeOk: false,
    publicWear: true,
    imagePath: null,
    includeInEngine: true,
    status: 'active',
    notes: null,
    attentionLevel: null,
    ...overrides,
  });

  beforeEach(async () => {
    hoardServiceSpy = jasmine.createSpyObj<HoardService>('HoardService', [
      'getShiniesForCurrentHoard',
    ]);

    await TestBed.configureTestingModule({
      imports: [HoardViewComponent],
      providers: [{ provide: HoardService, useValue: hoardServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(HoardViewComponent);
    component = fixture.componentInstance;
  });

  it('loading state: starts with loading visible', () => {
    const stream = new Subject<Shiny[]>();
    hoardServiceSpy.getShiniesForCurrentHoard.and.returnValue(stream.asObservable());

    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.textContent).toContain('Loading shinies...');
  });

  it('shows empty message when service returns no shinies', () => {
    hoardServiceSpy.getShiniesForCurrentHoard.and.returnValue(of([]));

    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.textContent).toContain('No shinies found in the current hoard.');
  });

  it('renders shiny count and mapped table values when service returns shinies', () => {
    const shinies: Shiny[] = [
      createShiny({ id: 'shiny-123', filename: '' }),
      createShiny({ id: 'shiny-456', filename: 'dragon-scale-cape' }),
    ];
    hoardServiceSpy.getShiniesForCurrentHoard.and.returnValue(of(shinies));

    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.textContent).toContain('2 shinies');
    expect(host.textContent).toContain('Name');
    expect(host.textContent).toContain('shiny-123');
    expect(host.textContent).toContain('accessory');
  });

  it('shows an error message when service throws', () => {
    spyOn(console, 'error');
    hoardServiceSpy.getShiniesForCurrentHoard.and.returnValue(
      throwError(() => new Error('boom'))
    );

    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.textContent).toContain('Hoard unavailable');
    expect(host.textContent).toContain(
      'Failed to load shinies. Please try again later.'
    );
  });

  it('filters rows by Category', () => {
    const shinies: Shiny[] = [
      createShiny({ id: 'a1', category: 'accessory', notes: 'belt' }),
      createShiny({ id: 't1', category: 'top', notes: 'tee' }),
      createShiny({ id: 'b1', category: 'bottom', notes: 'jeans' }),
    ];
    hoardServiceSpy.getShiniesForCurrentHoard.and.returnValue(of(shinies));

    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const select = host.querySelector('#category-filter') as HTMLSelectElement;
    select.value = 'top';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const rows = host.querySelectorAll('tr.mat-mdc-row');
    expect(rows.length).toBe(1);
    expect(host.textContent).toContain('tee');
    expect(host.textContent).not.toContain('belt');
  });

  it('filters rows by Context', () => {
    const shinies: Shiny[] = [
      createShiny({ id: 'c1', primaryContext: 'casual', notes: 'casual item' }),
      createShiny({ id: 'o1', primaryContext: 'office', notes: 'office item' }),
    ];
    hoardServiceSpy.getShiniesForCurrentHoard.and.returnValue(of(shinies));

    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const select = host.querySelector('#context-filter') as HTMLSelectElement;
    select.value = 'office';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const rows = host.querySelectorAll('tr.mat-mdc-row');
    expect(rows.length).toBe(1);
    expect(host.textContent).toContain('office item');
    expect(host.textContent).not.toContain('casual item');
  });

  it('filters rows by Status', () => {
    const shinies: Shiny[] = [
      createShiny({ id: 's1', status: 'owned', notes: 'owned item' }),
      createShiny({ id: 's2', status: 'needs-repair', notes: 'repair item' }),
    ];
    hoardServiceSpy.getShiniesForCurrentHoard.and.returnValue(of(shinies));

    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const select = host.querySelector('#status-filter') as HTMLSelectElement;
    select.value = 'needs-repair';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const rows = host.querySelectorAll('tr.mat-mdc-row');
    expect(rows.length).toBe(1);
    expect(host.textContent).toContain('repair item');
    expect(host.textContent).not.toContain('owned item');
  });

  it('filters rows by Color', () => {
    const shinies: Shiny[] = [
      createShiny({ id: 'k1', colorPrimary: 'black', notes: 'black item' }),
      createShiny({ id: 'n1', colorPrimary: 'navy', notes: 'navy item' }),
    ];
    hoardServiceSpy.getShiniesForCurrentHoard.and.returnValue(of(shinies));

    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const select = host.querySelector('#color-filter') as HTMLSelectElement;
    select.value = 'navy';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const rows = host.querySelectorAll('tr.mat-mdc-row');
    expect(rows.length).toBe(1);
    expect(host.textContent).toContain('navy item');
    expect(host.textContent).not.toContain('black item');
  });

  it('sorts rows by Category', () => {
    const shinies: Shiny[] = [
      createShiny({ id: 't1', category: 'top' }),
      createShiny({ id: 'a1', category: 'accessory' }),
      createShiny({ id: 'b1', category: 'bottom' }),
    ];
    hoardServiceSpy.getShiniesForCurrentHoard.and.returnValue(of(shinies));

    fixture.detectChanges();

    component.onSortChange({ active: 'category', direction: 'asc' } as Sort);

    expect(component.filteredShinies.map((shiny) => shiny.category)).toEqual([
      'accessory',
      'bottom',
      'top',
    ]);
  });

  it('sorts rows by Context', () => {
    const shinies: Shiny[] = [
      createShiny({ id: 'o1', primaryContext: 'office' }),
      createShiny({ id: 'c1', primaryContext: 'casual' }),
    ];
    hoardServiceSpy.getShiniesForCurrentHoard.and.returnValue(of(shinies));

    fixture.detectChanges();

    component.onSortChange({ active: 'context', direction: 'asc' } as Sort);

    expect(component.filteredShinies.map((shiny) => shiny.primaryContext)).toEqual([
      'casual',
      'office',
    ]);
  });

  it('sorts rows by Status', () => {
    const shinies: Shiny[] = [
      createShiny({ id: 'u1', status: 'unowned' }),
      createShiny({ id: 'o1', status: 'owned' }),
    ];
    hoardServiceSpy.getShiniesForCurrentHoard.and.returnValue(of(shinies));

    fixture.detectChanges();

    component.onSortChange({ active: 'status', direction: 'asc' } as Sort);

    expect(component.filteredShinies.map((shiny) => shiny.status)).toEqual([
      'owned',
      'unowned',
    ]);
  });

  it('sorts rows by Color', () => {
    const shinies: Shiny[] = [
      createShiny({ id: 'n1', colorPrimary: 'navy' }),
      createShiny({ id: 'b1', colorPrimary: 'black' }),
    ];
    hoardServiceSpy.getShiniesForCurrentHoard.and.returnValue(of(shinies));

    fixture.detectChanges();

    component.onSortChange({ active: 'color', direction: 'asc' } as Sort);

    expect(component.filteredShinies.map((shiny) => shiny.colorPrimary)).toEqual([
      'black',
      'navy',
    ]);
  });

  it('opens a larger image modal when clicking a shiny image', () => {
    const shinies: Shiny[] = [
      createShiny({
        id: 'img1',
        imagePath: '/resources/images/shiny-1.png',
        filename: 'shiny-1.png',
      }),
    ];
    hoardServiceSpy.getShiniesForCurrentHoard.and.returnValue(of(shinies));

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

  it('renders a font awesome image icon when imagePath is missing', () => {
    const shinies: Shiny[] = [createShiny({ id: 'no-image', imagePath: null })];
    hoardServiceSpy.getShiniesForCurrentHoard.and.returnValue(of(shinies));

    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const icon = host.querySelector('.image-fallback-icon');
    expect(icon).toBeTruthy();
    expect(icon?.classList.contains('fa-image')).toBeTrue();
  });

  it('shows modal header and detail rows for the selected shiny', () => {
    const shinies: Shiny[] = [
      createShiny({
        id: 'ABT_1',
        category: 'Accessories',
        subcategory: 'Belt',
        colorPrimary: 'Black',
        notes: 'Casual woven belt',
        imagePath: '/resources/images/shiny-1.png',
      }),
    ];
    hoardServiceSpy.getShiniesForCurrentHoard.and.returnValue(of(shinies));

    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const thumb = host.querySelector('.image-button') as HTMLButtonElement;
    thumb.click();
    fixture.detectChanges();

    const modalTitle = host.querySelector('.modal-title') as HTMLElement;
    const modalClose = host.querySelector('.modal-close') as HTMLButtonElement;
    const modalMeta = host.querySelector('.modal-meta') as HTMLElement;
    const modalNotes = host.querySelector('.modal-notes') as HTMLElement;

    expect(modalTitle.textContent).toContain('ABT_1');
    expect(modalClose).toBeTruthy();
    expect(modalMeta.textContent).toContain('Accessories');
    expect(modalMeta.textContent).toContain('Belt');
    expect(modalMeta.textContent).toContain('Black');
    expect(modalNotes.textContent).toContain('Casual woven belt');
  });
});
