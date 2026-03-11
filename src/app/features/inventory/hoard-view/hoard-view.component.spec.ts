import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HoardViewComponent } from './hoard-view.component';

describe('HoardViewComponent', () => {
  let component: HoardViewComponent;
  let fixture: ComponentFixture<HoardViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HoardViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HoardViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
