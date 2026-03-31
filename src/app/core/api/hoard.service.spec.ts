import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { HoardService } from './hoard.service';
import { GoblinService } from '../auth/goblin.service';
import { Goblin } from '../models/goblin.model';
import { Shiny } from '../models/shiny.model';
import { ShinyApiService } from './shiny-api.service';
import { ShinyAdapter } from './adapters/shiny.adapter';
import { ShinyResponseDto } from './dto/shiny-response.dto';
import { ShinyCreateRequestDto } from './dto/shiny-create-request.dto';
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
  let goblinServiceSpy: jasmine.SpyObj<GoblinService>;
  let shinyApiServiceSpy: jasmine.SpyObj<ShinyApiService>;
  let shinyAdapterSpy: jasmine.SpyObj<ShinyAdapter>;

  const currentGoblin: Goblin = {
    id: 'GBL-001',
    displayName: 'Snarkle',
    email: 'snarkle@goblin.fashion',
    defaultHoardId: 'HRD-001',
  };

  const dtoResponse: ShinyResponseDto[] = [
    {
      id: 'SH-001',
      goblinId: 'GBL-001',
      hoardId: 'HRD-001',
      name: 'Navy Quarter Zip',
      count: 1,
      category: 'TOP',
      subcategory: 'Sweater',
      layer: 'MID',
      contexts: ['OFFICE', 'CASUAL'],
      formality: 'SMART_CASUAL',
      attention: 'LOW',
      colorPrimary: 'NAVY',
      colorSecondary: 'GREY',
      fabric: 'Cotton',
      fit: 'Regular',
      warmth: 2,
      officeOk: true,
      publicWear: true,
      includeInEngine: true,
      engineInclusionPolicy: 'NORMAL',
      status: 'OWNED',
      notes: 'Reliable office layer',
    },
  ];

  const adaptedResponse: Shiny[] = [
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
    shinyApiServiceSpy = jasmine.createSpyObj<ShinyApiService>('ShinyApiService', [
      'getShiniesByGoblinAndHoard',
      'createShinyForGoblinAndHoard',
      'deleteShinyForGoblinAndHoard',
    ]);
    shinyAdapterSpy = jasmine.createSpyObj<ShinyAdapter>('ShinyAdapter', [
      'fromDtoList',
      'fromDto',
    ]);

    TestBed.configureTestingModule({
      providers: [
        HoardService,
        { provide: GoblinService, useValue: goblinServiceSpy },
        { provide: ShinyApiService, useValue: shinyApiServiceSpy },
        { provide: ShinyAdapter, useValue: shinyAdapterSpy },
      ],
    });

    service = TestBed.inject(HoardService);
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

    expect(shinyApiServiceSpy.getShiniesByGoblinAndHoard).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it('should build a hoard payload from API dto + adapter for an authenticated goblin', () => {
    goblinServiceSpy.getCurrentGoblin.and.returnValue(of(currentGoblin));
    shinyApiServiceSpy.getShiniesByGoblinAndHoard.and.returnValue(of(dtoResponse));
    shinyAdapterSpy.fromDtoList.and.returnValue(adaptedResponse);

    let result: unknown;
    service.getHoardById('HRD-001').subscribe((hoard) => {
      result = hoard;
    });

    expect(shinyApiServiceSpy.getShiniesByGoblinAndHoard).toHaveBeenCalledOnceWith(
      'GBL-001',
      'HRD-001',
    );
    expect(shinyAdapterSpy.fromDtoList).toHaveBeenCalledOnceWith(dtoResponse);
    expect(result).toEqual({
      id: 'HRD-001',
      goblinId: 'GBL-001',
      name: 'Main Hoard',
      isDefault: true,
      isActive: true,
      shinies: adaptedResponse,
    });
  });

  it('should use goblin.defaultHoardId in getCurrentHoard', () => {
    goblinServiceSpy.getCurrentGoblin.and.returnValue(of(currentGoblin));
    shinyApiServiceSpy.getShiniesByGoblinAndHoard.and.returnValue(of(dtoResponse));
    shinyAdapterSpy.fromDtoList.and.returnValue(adaptedResponse);

    let result: unknown;
    service.getCurrentHoard().subscribe((hoard) => {
      result = hoard;
    });

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

  it('should create a shiny for the authenticated goblin default hoard', () => {
    const createPayload: ShinyCreateRequestDto = {
      id: 'SH-777',
      name: 'Gold Ring',
      count: 1,
      category: 'ACCESSORY',
      layer: 'ACCESSORY',
      contexts: ['FORMAL'],
      formality: 'FORMAL',
      attention: 'MEDIUM',
      colorPrimary: 'GOLD',
      officeOk: true,
      publicWear: true,
      includeInEngine: true,
      engineInclusionPolicy: 'NORMAL',
      status: 'OWNED',
    };

    const createdDto: ShinyResponseDto = {
      id: 'SH-777',
      goblinId: 'GBL-001',
      hoardId: 'HRD-001',
      name: 'Gold Ring',
      count: 1,
      category: 'ACCESSORY',
      layer: 'ACCESSORY',
      contexts: ['FORMAL'],
      formality: 'FORMAL',
      attention: 'MEDIUM',
      colorPrimary: 'GOLD',
      officeOk: true,
      publicWear: true,
      includeInEngine: true,
      engineInclusionPolicy: 'NORMAL',
      status: 'OWNED',
    };

    const adaptedShiny: Shiny = {
      id: 'SH-777',
      goblinId: 'GBL-001',
      hoardId: 'HRD-001',
      name: 'Gold Ring',
      count: 1,
      category: ShinyCategory.ACCESSORY,
      subcategory: 'Ring',
      layer: Layer.ACCESSORY,
      contexts: [Context.FORMAL],
      formality: Formality.FORMAL,
      attention: Attention.MEDIUM,
      colorPrimary: Color.GOLD,
      officeOk: true,
      publicWear: true,
      includeInEngine: true,
      engineInclusionPolicy: EngineInclusionPolicy.NORMAL,
      status: ShinyStatus.OWNED,
    };

    goblinServiceSpy.getCurrentGoblin.and.returnValue(of(currentGoblin));
    shinyApiServiceSpy.createShinyForGoblinAndHoard.and.returnValue(of(createdDto));
    shinyAdapterSpy.fromDto.and.returnValue(adaptedShiny);

    let result: Shiny | undefined;
    service.createShinyForCurrentHoard(createPayload).subscribe((created) => {
      result = created;
    });

    expect(shinyApiServiceSpy.createShinyForGoblinAndHoard).toHaveBeenCalledOnceWith(
      'GBL-001',
      'HRD-001',
      createPayload,
    );
    expect(shinyAdapterSpy.fromDto).toHaveBeenCalledOnceWith(createdDto);
    expect(result).toBeDefined();
    expect(result?.id).toBe('SH-777');
  });

  it('should delete a shiny for the authenticated goblin default hoard', () => {
    goblinServiceSpy.getCurrentGoblin.and.returnValue(of(currentGoblin));
    shinyApiServiceSpy.deleteShinyForGoblinAndHoard.and.returnValue(of(void 0));

    let completed = false;
    service.deleteShinyForCurrentHoard('SH-DELETE-1').subscribe(() => {
      completed = true;
    });

    expect(shinyApiServiceSpy.deleteShinyForGoblinAndHoard).toHaveBeenCalledOnceWith(
      'GBL-001',
      'HRD-001',
      'SH-DELETE-1',
    );
    expect(completed).toBeTrue();
  });
});
