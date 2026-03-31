import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { ShinyApiService } from './shiny-api.service';

describe('ShinyApiService', () => {
  let service: ShinyApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ShinyApiService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(ShinyApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call shiny endpoint and return backend dto payload', () => {
    let resultLength = 0;
    service.getShiniesByGoblinAndHoard('GBL-001', 'HRD-001').subscribe((response) => {
      resultLength = response.length;
    });

    const request = httpMock.expectOne('/api/goblins/GBL-001/hoards/HRD-001/shinies');
    expect(request.request.method).toBe('GET');
    request.flush([
      {
        id: 'SH-001',
        goblinId: 'GBL-001',
        hoardId: 'HRD-001',
        count: 1,
        category: 'TOP',
        layer: 'MID',
        contexts: ['CASUAL'],
        formality: 'CASUAL',
        attention: 'LOW',
        colorPrimary: 'BLACK',
        officeOk: false,
        publicWear: true,
        includeInEngine: true,
        engineInclusionPolicy: 'NORMAL',
        status: 'OWNED',
      },
    ]);

    expect(resultLength).toBe(1);
  });

  it('should post a shiny create payload to the shiny endpoint', () => {
    let createdId = '';
    service
      .createShinyForGoblinAndHoard('GBL-001', 'HRD-001', {
        id: 'SH-NEW-1',
        name: 'New Vest',
        count: 1,
        category: 'TOP',
        layer: 'MID',
        contexts: ['CASUAL'],
        formality: 'CASUAL',
        attention: 'LOW',
        colorPrimary: 'BLACK',
        officeOk: true,
        publicWear: true,
        includeInEngine: true,
        engineInclusionPolicy: 'NORMAL',
        status: 'OWNED',
      })
      .subscribe((response) => {
        createdId = response.id;
      });

    const request = httpMock.expectOne('/api/goblins/GBL-001/hoards/HRD-001/shinies');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(
      jasmine.objectContaining({
        id: 'SH-NEW-1',
        name: 'New Vest',
        category: 'TOP',
        colorPrimary: 'BLACK',
      }),
    );

    request.flush({
      id: 'SH-NEW-1',
      goblinId: 'GBL-001',
      hoardId: 'HRD-001',
      name: 'New Vest',
      count: 1,
      category: 'TOP',
      layer: 'MID',
      contexts: ['CASUAL'],
      formality: 'CASUAL',
      attention: 'LOW',
      colorPrimary: 'BLACK',
      officeOk: true,
      publicWear: true,
      includeInEngine: true,
      engineInclusionPolicy: 'NORMAL',
      status: 'OWNED',
    });

    expect(createdId).toBe('SH-NEW-1');
  });

  it('should delete a shiny by id from the shiny endpoint', () => {
    let completed = false;
    service.deleteShinyForGoblinAndHoard('GBL-001', 'HRD-001', 'SH-DELETE-1').subscribe({
      next: () => {
        completed = true;
      },
    });

    const request = httpMock.expectOne(
      '/api/goblins/GBL-001/hoards/HRD-001/shinies/SH-DELETE-1',
    );
    expect(request.request.method).toBe('DELETE');
    request.flush(null);

    expect(completed).toBeTrue();
  });
});
