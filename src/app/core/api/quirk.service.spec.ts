import { TestBed } from '@angular/core/testing';

import { QuirkService } from './quirk.service';

describe('QuirkService', () => {
  let service: QuirkService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QuirkService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
