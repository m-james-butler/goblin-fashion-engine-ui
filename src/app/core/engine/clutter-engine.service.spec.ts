import { TestBed } from '@angular/core/testing';

import { ClutterEngineService } from './clutter-engine.service';

describe('ClutterEngineService', () => {
  let service: ClutterEngineService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClutterEngineService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
