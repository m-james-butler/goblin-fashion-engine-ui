import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Sort } from '@angular/material/sort';

import { HoardInventoryGridComponent } from './hoard-inventory-grid.component';
import {
  Attention,
  Color,
  Context,
  EngineInclusionPolicy,
  Formality,
  Layer,
  ShinyCategory,
  ShinyStatus,
} from '../../../../core/models/enums';
import { Shiny } from '../../../../core/models/shiny.model';

describe('HoardInventoryGridComponent', () => {
  let fixture: ComponentFixture<HoardInventoryGridComponent>;
  let component: HoardInventoryGridComponent;
  let shiny: Shiny;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HoardInventoryGridComponent],
    }).compileComponents();

    shiny = createShiny();
    fixture = TestBed.createComponent(HoardInventoryGridComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('shinies', [shiny]);
    fixture.detectChanges();
  });

  it('renders the shiny row with image, primary context, and extra context count', () => {
    const host = fixture.nativeElement as HTMLElement;

    expect(host.querySelector('.shiny-image')?.getAttribute('src')).toBe('/images/navy.png');
    expect(host.textContent).toContain('Navy Jacket');
    expect(host.textContent).toContain('+1');
  });

  it('renders fallbacks when image, notes, and contexts are missing', () => {
    fixture.componentRef.setInput('shinies', [
      createShiny({
        imagePath: undefined,
        name: undefined,
        notes: undefined,
        contexts: [],
      }),
    ]);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('.image-fallback-icon')).toBeTruthy();
    expect(host.textContent).toContain('SH-001');
    expect(host.textContent).toContain('-');
  });

  it('emits sort, view, edit, and delete events', () => {
    const sort: Sort = { active: 'category', direction: 'asc' };
    spyOn(component.sortChanged, 'emit');
    spyOn(component.viewRequested, 'emit');
    spyOn(component.editRequested, 'emit');
    spyOn(component.deleteRequested, 'emit');

    component.onSortChange(sort);
    component.openDetail(shiny);
    component.editShiny(shiny);
    component.deleteShiny(shiny);

    expect(component.sortChanged.emit).toHaveBeenCalledWith(sort);
    expect(component.viewRequested.emit).toHaveBeenCalledWith(shiny);
    expect(component.editRequested.emit).toHaveBeenCalledWith(shiny);
    expect(component.deleteRequested.emit).toHaveBeenCalledWith(shiny);
  });
});

function createShiny(overrides: Partial<Shiny> = {}): Shiny {
  return {
    id: 'SH-001',
    goblinId: 'GBL-001',
    hoardId: 'HRD-001',
    name: 'Navy Jacket',
    count: 1,
    category: ShinyCategory.TOP,
    layer: Layer.MID,
    contexts: [Context.OFFICE, Context.CASUAL],
    formality: Formality.SMART_CASUAL,
    attention: Attention.LOW,
    colorPrimary: Color.NAVY,
    officeOk: true,
    publicWear: true,
    includeInEngine: true,
    engineInclusionPolicy: EngineInclusionPolicy.NORMAL,
    imagePath: '/images/navy.png',
    notes: 'Warm',
    status: ShinyStatus.OWNED,
    ...overrides,
  };
}
