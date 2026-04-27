import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, NgForm } from '@angular/forms';

import { ShinyEditorModalComponent } from './shiny-editor-modal.component';
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
import { ShinyFormModel } from '../shiny-form.model';

describe('ShinyEditorModalComponent', () => {
  let fixture: ComponentFixture<ShinyEditorModalComponent>;
  let component: ShinyEditorModalComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule, ShinyEditorModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ShinyEditorModalComponent);
    component = fixture.componentInstance;
    component.isOpen = true;
    component.form = createForm();
    component.categoryValues = [ShinyCategory.TOP];
    component.layerValues = [Layer.MID];
    component.contextValues = [Context.OFFICE, Context.CASUAL];
    component.formalityValues = [Formality.SMART_CASUAL];
    component.attentionValues = [Attention.LOW];
    component.colorValues = [Color.NAVY];
    component.patternValues = [Pattern.SOLID];
    component.engineInclusionPolicyValues = [EngineInclusionPolicy.NORMAL];
    component.statusValues = [ShinyStatus.OWNED];
    fixture.detectChanges();
  });

  it('renders only while open and uses configured labels', () => {
    expect(fixture.nativeElement.textContent).toContain('Shiny Editor');

    component.isOpen = false;
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain('Shiny Editor');
  });

  it('adds and removes contexts from the form', () => {
    component.toggleContextSelection(Context.CASUAL, checkboxEvent(true));
    expect(component.form.contexts).toEqual([Context.OFFICE, Context.CASUAL]);

    component.toggleContextSelection(Context.CASUAL, checkboxEvent(true));
    expect(component.form.contexts).toEqual([Context.OFFICE, Context.CASUAL]);

    component.toggleContextSelection(Context.OFFICE, checkboxEvent(false));
    expect(component.form.contexts).toEqual([Context.CASUAL]);
  });

  it('emits close events from the close action', () => {
    spyOn(component.closed, 'emit');

    component.closeModal();

    expect(component.closed.emit).toHaveBeenCalled();
  });

  it('emits save only when form is valid and not already submitting', () => {
    spyOn(component.saved, 'emit');

    component.submit({ invalid: true } as NgForm);
    expect(component.saved.emit).not.toHaveBeenCalled();

    component.isSubmitting = true;
    component.submit({ invalid: false } as NgForm);
    expect(component.saved.emit).not.toHaveBeenCalled();

    component.isSubmitting = false;
    component.submit({ invalid: false } as NgForm);
    expect(component.saved.emit).toHaveBeenCalled();
  });

  it('builds stable field ids', () => {
    component.fieldIdPrefix = 'edit-shiny';

    expect(component.fieldId('name')).toBe('edit-shiny-name');
  });
});

function checkboxEvent(checked: boolean): Event {
  return { target: { checked } } as unknown as Event;
}

function createForm(): ShinyFormModel {
  return {
    name: 'Navy Jacket',
    notes: '',
    count: 1,
    category: ShinyCategory.TOP,
    subcategory: '',
    layer: Layer.MID,
    contexts: [Context.OFFICE],
    formality: Formality.SMART_CASUAL,
    attention: Attention.LOW,
    colorPrimary: Color.NAVY,
    colorSecondary: '',
    pattern: '',
    fabric: '',
    fit: '',
    warmth: '',
    officeOk: true,
    publicWear: true,
    includeInEngine: true,
    engineInclusionPolicy: EngineInclusionPolicy.NORMAL,
    imagePathPlaceholder: '',
    status: ShinyStatus.OWNED,
  };
}
