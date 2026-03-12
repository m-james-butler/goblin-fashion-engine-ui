import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { HoardService } from './hoard.service';
import { GoblinService } from '../auth/goblin.service';
import { Shiny } from '../models/shiny.model';
import { Hoard } from '../models/hoard.model';
import { Goblin } from '../models/goblin.model';

describe('HoardService', () => {
  let service: HoardService;
  let httpMock: HttpTestingController;
  let goblinServiceSpy: jasmine.SpyObj<GoblinService>;
  let loggedInGoblin: Goblin;

  beforeEach(() => {
    goblinServiceSpy = jasmine.createSpyObj<GoblinService>('GoblinService', ['getLoggedInGoblinId', 'getLoggedInGoblin']);
    loggedInGoblin = {
      id: 'GBL-001',
      name: 'Snarkle',
      hoardId: 'HRD-001',
    };

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

  it('should retrieve a hoard by id for the logged-in goblin using inventory data', () => {
    goblinServiceSpy.getLoggedInGoblinId.and.returnValue('GBL-001');

    const inventory: Shiny[] = [
      {
        id: 'SH-001',
        count: 1,
        category: 'Top',
        subcategory: 'Sweater',
        filename: 'navy-quarter-zip.jpg',
        primaryContext: 'Office',
        secondaryContext: 'Casual',
        formality: 'Smart Casual',
        warmth: 2,
        layer: 'Mid',
        colorPrimary: 'Navy',
        colorSecondary: null,
        pattern: null,
        fabric: 'Cotton',
        fit: 'Regular',
        officeOk: true,
        publicWear: true,
        imagePath: '/resources/images/Shirts/navy-quarter-zip.jpg',
        includeInEngine: true,
        status: 'Active',
        notes: 'Reliable office layer',
        attentionLevel: 'Low',
      },
    ];

    let result: Hoard | null | undefined;

    service.getHoardById('HRD-001').subscribe((hoard) => {
      result = hoard;
    });

    const request = httpMock.expectOne('/resources/inventory.json');
    expect(request.request.method).toBe('GET');
    request.flush(inventory);

    expect(result).toEqual({
      id: 'HRD-001',
      name: 'Main Hoard',
      goblinId: 'GBL-001',
      shinies: inventory,
    });
  });

  it('should return null when no goblin is logged in', () => {
    goblinServiceSpy.getLoggedInGoblinId.and.returnValue(null);

    let result: Hoard | null | undefined;

    service.getHoardById('HRD-001').subscribe((hoard) => {
      result = hoard;
    });

    httpMock.expectNone('/resources/inventory.json');
    expect(result).toBeNull();
  });

  it('should return null from getCurrentHoard when no goblin is logged in', () => {
    goblinServiceSpy.getLoggedInGoblin.and.returnValue(null);

    let result: Hoard | null | undefined;

    service.getCurrentHoard().subscribe((hoard) => {
      result = hoard;
    });

    httpMock.expectNone('/resources/inventory.json');
    expect(result).toBeNull();
  });

  it('should return the current goblin hoard from getCurrentHoard when a goblin is logged in', () => {
    goblinServiceSpy.getLoggedInGoblin.and.returnValue(loggedInGoblin);
    goblinServiceSpy.getLoggedInGoblinId.and.returnValue(loggedInGoblin.id);

    const inventory: Shiny[] = [
      {
        id: 'SH-001',
        count: 1,
        category: 'Top',
        subcategory: 'Sweater',
        filename: 'navy-quarter-zip.jpg',
        primaryContext: 'Office',
        secondaryContext: 'Casual',
        formality: 'Smart Casual',
        warmth: 2,
        layer: 'Mid',
        colorPrimary: 'Navy',
        colorSecondary: null,
        pattern: null,
        fabric: 'Cotton',
        fit: 'Regular',
        officeOk: true,
        publicWear: true,
        imagePath: '/resources/images/Shirts/navy-quarter-zip.jpg',
        includeInEngine: true,
        status: 'Active',
        notes: 'Reliable office layer',
        attentionLevel: 'Low',
      },
    ];

    let result: Hoard | null | undefined;

    service.getCurrentHoard().subscribe((hoard) => {
      result = hoard;
    });

    const request = httpMock.expectOne('/resources/inventory.json');
    expect(request.request.method).toBe('GET');
    request.flush(inventory);

    expect(result).toEqual({
      id: 'HRD-001',
      name: 'Main Hoard',
      goblinId: 'GBL-001',
      shinies: inventory,
    });
  });

  it('should return null from getCurrentHoard when goblin exists but hoard lookup fails', () => {
    goblinServiceSpy.getLoggedInGoblin.and.returnValue(loggedInGoblin);
    goblinServiceSpy.getLoggedInGoblinId.and.returnValue(loggedInGoblin.id);

    let result: Hoard | null | undefined;

    service.getCurrentHoard().subscribe((hoard) => {
      result = hoard;
    });

    const request = httpMock.expectOne('/resources/inventory.json');
    request.flush('lookup failed', { status: 404, statusText: 'Not Found' });

    expect(result).toBeNull();
  });

  it('should return an empty array from getShiniesForCurrentHoard when no goblin is logged in', () => {
    goblinServiceSpy.getLoggedInGoblin.and.returnValue(null);

    let result: Shiny[] | undefined;

    service.getShiniesForCurrentHoard().subscribe((shinies) => {
      result = shinies;
    });

    httpMock.expectNone('/resources/inventory.json');
    expect(result).toEqual([]);
  });

  it('should return an empty array from getShiniesForCurrentHoard when the hoard is missing', () => {
    goblinServiceSpy.getLoggedInGoblin.and.returnValue(loggedInGoblin);
    goblinServiceSpy.getLoggedInGoblinId.and.returnValue(loggedInGoblin.id);

    let result: Shiny[] | undefined;

    service.getShiniesForCurrentHoard().subscribe((shinies) => {
      result = shinies;
    });

    const request = httpMock.expectOne('/resources/inventory.json');
    request.flush('lookup failed', { status: 404, statusText: 'Not Found' });

    expect(result).toEqual([]);
  });

  it('should return the current hoard shinies from getShiniesForCurrentHoard', () => {
    goblinServiceSpy.getLoggedInGoblin.and.returnValue(loggedInGoblin);
    goblinServiceSpy.getLoggedInGoblinId.and.returnValue(loggedInGoblin.id);

    const inventory: Shiny[] = [
      {
        id: 'SH-001',
        count: 1,
        category: 'Top',
        subcategory: 'Sweater',
        filename: 'navy-quarter-zip.jpg',
        primaryContext: 'Office',
        secondaryContext: 'Casual',
        formality: 'Smart Casual',
        warmth: 2,
        layer: 'Mid',
        colorPrimary: 'Navy',
        colorSecondary: null,
        pattern: null,
        fabric: 'Cotton',
        fit: 'Regular',
        officeOk: true,
        publicWear: true,
        imagePath: '/resources/images/Shirts/navy-quarter-zip.jpg',
        includeInEngine: true,
        status: 'Active',
        notes: 'Reliable office layer',
        attentionLevel: 'Low',
      },
    ];

    let result: Shiny[] | undefined;

    service.getShiniesForCurrentHoard().subscribe((shinies) => {
      result = shinies;
    });

    const request = httpMock.expectOne('/resources/inventory.json');
    expect(request.request.method).toBe('GET');
    request.flush(inventory);

    expect(result).toEqual(inventory);
  });
});
