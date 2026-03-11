import { TestBed } from '@angular/core/testing';

import { OutfitsService } from './outfits.service';

describe('OutfitsService', () => {
  let service: OutfitsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OutfitsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
