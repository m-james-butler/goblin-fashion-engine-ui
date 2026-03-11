import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClutterMashComponent } from './clutter-mash.component';

describe('ClutterMashComponent', () => {
  let component: ClutterMashComponent;
  let fixture: ComponentFixture<ClutterMashComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClutterMashComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClutterMashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
