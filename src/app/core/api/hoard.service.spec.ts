import { TestBed } from '@angular/core/testing';

import { HoardService } from './hoard.service';

describe('HoardService', () => {
  let service: HoardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HoardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
