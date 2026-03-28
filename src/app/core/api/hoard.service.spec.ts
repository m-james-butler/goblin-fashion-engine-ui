import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

import { HoardService } from './hoard.service';
import { GoblinService } from '../auth/goblin.service';
import { Goblin } from '../models/goblin.model';
import { Shiny } from '../models/shiny.model';
import {
  Attention,
  Color,
  Context,
  EngineInclusionPolicy,
  Formality,
  Layer,
  ShinyCategory,
  ShinyStatus,
} from '../models/enums';

describe('HoardService', () => {
  let service: HoardService;
  let httpMock: HttpTestingController;
  let goblinServiceSpy: jasmine.SpyObj<GoblinService>;

  const currentGoblin: Goblin = {
    id: 'GBL-001',
    displayName: 'Snarkle',
    email: 'snarkle@goblin.fashion',
    defaultHoardId: 'HRD-001',
  };

  const apiResponse: Shiny[] = [
    {
      id: 'SH-001',
      goblinId: 'GBL-001',
      hoardId: 'HRD-001',
      name: 'Navy Quarter Zip',
      count: 1,
      category: ShinyCategory.TOP,
      subcategory: 'Sweater',
      layer: Layer.MID,
      contexts: [Context.OFFICE, Context.CASUAL],
      formality: Formality.SMART_CASUAL,
      attention: Attention.LOW,
      colorPrimary: Color.NAVY,
      colorSecondary: Color.GREY,
      fabric: 'Cotton',
      fit: 'Regular',
      warmth: 2,
      officeOk: true,
      publicWear: true,
      includeInEngine: true,
      engineInclusionPolicy: EngineInclusionPolicy.NORMAL,
      status: ShinyStatus.OWNED,
      notes: 'Reliable office layer',
    },
  ];

  beforeEach(() => {
    goblinServiceSpy = jasmine.createSpyObj<GoblinService>('GoblinService', [
      'getCurrentGoblin',
    ]);

    TestBed.configureTestingModule({
      providers: [
        HoardService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: GoblinService, useValue: goblinServiceSpy },
      ],
    });

    service = TestBed.inject(HoardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return null for getHoardById when no goblin is authenticated', () => {
    goblinServiceSpy.getCurrentGoblin.and.returnValue(of(null));

    let result: unknown;
    service.getHoardById('HRD-001').subscribe((hoard) => {
      result = hoard;
    });

    httpMock.expectNone('/api/goblins/GBL-001/hoards/HRD-001/shinies');
    expect(result).toBeNull();
  });

  it('should build a hoard payload from API response for an authenticated goblin', () => {
    goblinServiceSpy.getCurrentGoblin.and.returnValue(of(currentGoblin));

    let result: unknown;
    service.getHoardById('HRD-001').subscribe((hoard) => {
      result = hoard;
    });

    const request = httpMock.expectOne(
      '/api/goblins/GBL-001/hoards/HRD-001/shinies',
    );
    expect(request.request.method).toBe('GET');
    request.flush(apiResponse);

    expect(result).toEqual({
      id: 'HRD-001',
      goblinId: 'GBL-001',
      name: 'Main Hoard',
      isDefault: true,
      isActive: true,
      shinies: apiResponse,
    });
  });

  it('should return null from getCurrentHoard when no goblin is authenticated', () => {
    goblinServiceSpy.getCurrentGoblin.and.returnValue(of(null));

    let result: unknown;
    service.getCurrentHoard().subscribe((hoard) => {
      result = hoard;
    });

    httpMock.expectNone('/api/goblins/GBL-001/hoards/HRD-001/shinies');
    expect(result).toBeNull();
  });

  it('should use goblin.defaultHoardId in getCurrentHoard', () => {
    goblinServiceSpy.getCurrentGoblin.and.returnValue(of(currentGoblin));

    let result: unknown;
    service.getCurrentHoard().subscribe((hoard) => {
      result = hoard;
    });

    const request = httpMock.expectOne(
      '/api/goblins/GBL-001/hoards/HRD-001/shinies',
    );
    request.flush(apiResponse);

    expect((result as { id: string }).id).toBe('HRD-001');
  });

  it('should return an empty list from getShiniesForCurrentHoard when hoard lookup fails', () => {
    goblinServiceSpy.getCurrentGoblin.and.returnValue(of(currentGoblin));

    spyOn(service, 'getCurrentHoard').and.returnValue(
      throwError(() => new Error('lookup failed')),
    );

    let result: Shiny[] = [];
    service.getShiniesForCurrentHoard().subscribe((shinies) => {
      result = shinies;
    });

    expect(result).toEqual([]);
  });
});
