import { TestBed } from '@angular/core/testing';

import { ClutterService } from './clutter.service';

describe('ClutterService', () => {
  let service: ClutterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClutterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
