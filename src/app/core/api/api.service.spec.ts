import { TestBed } from '@angular/core/testing';

import { ApiService } from './api.service';

describe('ApiService', () => {
  let service: ApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should build goblin hoard shinies API path', () => {
    expect(service.buildGoblinHoardShiniesPath('GBL-001', 'HRD-001')).toBe(
      '/api/goblins/GBL-001/hoards/HRD-001/shinies',
    );
  });
});
