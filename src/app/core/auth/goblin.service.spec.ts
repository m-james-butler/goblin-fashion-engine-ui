import { TestBed } from '@angular/core/testing';

import { GoblinService } from './goblin.service';
import { Goblin } from '../models/goblin.model';

describe('GoblinService', () => {
  let service: GoblinService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GoblinService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return the id of the logged-in goblin', () => {
    expect(service.getLoggedInGoblinId()).toBe('GBL-001');
  });

  it('should return the full logged-in goblin', () => {
    const result = service.getLoggedInGoblin();

    const expected: Goblin = {
      id: 'GBL-001',
      name: 'Snarkle',
      hoardId: 'HRD-001',
    };

    expect(result).toEqual(expected);
  });
});
