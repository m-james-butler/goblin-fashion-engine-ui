import { TestBed } from '@angular/core/testing';

import { ShinyService } from './shiny.service';

describe('ShinyService', () => {
  let service: ShinyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShinyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
