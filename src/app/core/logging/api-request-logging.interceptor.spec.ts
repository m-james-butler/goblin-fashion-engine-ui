import {
  HttpClient,
  HttpErrorResponse,
  HttpEventType,
  HttpRequest,
  HttpResponse,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { throwError } from 'rxjs';

import { apiRequestLoggingInterceptor } from './api-request-logging.interceptor';
import { AppLoggerService } from './app-logger.service';

describe('apiRequestLoggingInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let loggerSpy: jasmine.SpyObj<AppLoggerService>;

  beforeEach(() => {
    loggerSpy = jasmine.createSpyObj<AppLoggerService>('AppLoggerService', ['debug', 'info', 'warn']);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([apiRequestLoggingInterceptor])),
        provideHttpClientTesting(),
        { provide: AppLoggerService, useValue: loggerSpy },
      ],
    });

    spyOn(crypto, 'randomUUID').and.returnValue('00000000-0000-4000-8000-000000000001');
    spyOn(performance, 'now').and.returnValues(100, 145, 200, 260);

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('does not log non-api requests', () => {
    httpClient.get('/assets/config.json').subscribe();

    httpMock.expectOne('/assets/config.json').flush({});

    expect(loggerSpy.debug).not.toHaveBeenCalled();
    expect(loggerSpy.info).not.toHaveBeenCalled();
  });

  it('logs sanitized successful API responses', () => {
    httpClient.get('/api/goblins/GBL-001/hoards/HRD-001/shinies/SH-001').subscribe();

    const request = httpMock.expectOne('/api/goblins/GBL-001/hoards/HRD-001/shinies/SH-001');
    request.event(new HttpResponse({ status: 200, body: {} }));

    expect(loggerSpy.debug).toHaveBeenCalledWith(
      'api.request.started',
      jasmine.objectContaining({
        requestId: '00000000-0000-4000-8000-000000000001',
        endpoint: '/api/goblins/{goblinId}/hoards/{hoardId}/shinies/{shinyId}',
      }),
    );
    expect(loggerSpy.info).toHaveBeenCalledWith(
      'api.request.succeeded',
      jasmine.objectContaining({
        status: 200,
        durationMs: 45,
      }),
    );
  });

  it('ignores non-response HTTP events', () => {
    httpClient.get('/api/goblins/GBL-001/hoards/HRD-001/shinies').subscribe();

    const request = httpMock.expectOne('/api/goblins/GBL-001/hoards/HRD-001/shinies');
    request.event({ type: HttpEventType.Sent });
    request.flush([]);

    expect(loggerSpy.info).toHaveBeenCalledTimes(1);
  });

  it('logs failed API responses with status when available', (done) => {
    httpClient.get('/api/goblins/GBL-001/hoards/HRD-001/shinies').subscribe({
      error: (error: HttpErrorResponse) => {
        expect(error.status).toBe(500);
        expect(loggerSpy.warn).toHaveBeenCalledWith(
          'api.request.failed',
          jasmine.objectContaining({
            status: 500,
            durationMs: 45,
          }),
        );
        done();
      },
    });

    httpMock.expectOne('/api/goblins/GBL-001/hoards/HRD-001/shinies').flush(
      { message: 'nope' },
      { status: 500, statusText: 'Server Error' },
    );
  });

  it('logs unknown failures with fallback status', (done) => {
    TestBed.runInInjectionContext(() => {
      const request = new HttpRequest('GET', '/api/goblins/GBL-001/hoards/HRD-001/shinies');

      apiRequestLoggingInterceptor(request, () => throwError(() => 'network failed')).subscribe({
        error: (error: unknown) => {
          expect(error).toBe('network failed');
          expect(loggerSpy.warn).toHaveBeenCalledWith(
            'api.request.failed',
            jasmine.objectContaining({
              status: -1,
              durationMs: 45,
            }),
          );
          done();
        },
      });
    });
  });
});
