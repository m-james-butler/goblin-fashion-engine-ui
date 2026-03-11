import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuirkLogicComponent } from './quirk-logic.component';

describe('QuirkLogicComponent', () => {
  let component: QuirkLogicComponent;
  let fixture: ComponentFixture<QuirkLogicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuirkLogicComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuirkLogicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
