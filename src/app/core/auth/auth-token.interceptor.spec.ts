import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';

import { authTokenInterceptor } from './auth-token.interceptor';
import { AuthService } from './auth.service';
import { AppLoggerService } from '../logging/app-logger.service';
import { environment } from '../../../environments/environments';

describe('authTokenInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let loggerSpy: jasmine.SpyObj<AppLoggerService>;
  let apiBaseUrl: string;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', ['getCurrentUserIdToken']);
    loggerSpy = jasmine.createSpyObj<AppLoggerService>('AppLoggerService', ['debug', 'warn']);
    apiBaseUrl = environment.apiBaseUrl;

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authTokenInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceSpy },
        { provide: AppLoggerService, useValue: loggerSpy },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    environment.apiBaseUrl = apiBaseUrl;
  });

  it('passes non-goblin API requests without requesting a token', () => {
    httpClient.get('/api/health').subscribe();

    const request = httpMock.expectOne('/api/health');
    expect(request.request.headers.has('Authorization')).toBeFalse();
    request.flush({});
    expect(authServiceSpy.getCurrentUserIdToken).not.toHaveBeenCalled();
  });

  it('attaches bearer token to goblin API requests', fakeAsync(() => {
    authServiceSpy.getCurrentUserIdToken.and.resolveTo('id-token');

    httpClient.get('/api/goblins/GBL-001/hoards/HRD-001/shinies').subscribe();
    tick();

    const request = httpMock.expectOne('/api/goblins/GBL-001/hoards/HRD-001/shinies');
    expect(request.request.headers.get('Authorization')).toBe('Bearer id-token');
    request.flush([]);
    expect(loggerSpy.debug).toHaveBeenCalledWith(
      'auth.token.interceptor.attached-token',
      jasmine.objectContaining({
        endpoint: '/api/goblins/{goblinId}/hoards/{hoardId}/shinies',
      }),
    );
  }));

  it('attaches bearer token to absolute goblin API requests', fakeAsync(() => {
    environment.apiBaseUrl = 'https://api.example.test';
    authServiceSpy.getCurrentUserIdToken.and.resolveTo('id-token');

    httpClient.get('https://api.example.test/api/goblins/GBL-001/hoards/HRD-001/shinies').subscribe();
    tick();

    const request = httpMock.expectOne(
      'https://api.example.test/api/goblins/GBL-001/hoards/HRD-001/shinies',
    );
    expect(request.request.headers.get('Authorization')).toBe('Bearer id-token');
    request.flush([]);
  }));

  it('emits a client unauthorized error when a required token is missing', (done) => {
    authServiceSpy.getCurrentUserIdToken.and.resolveTo(null);

    httpClient.get('/api/goblins/GBL-001/hoards/HRD-001/shinies').subscribe({
      error: (error) => {
        expect(error.status).toBe(401);
        expect(loggerSpy.warn).toHaveBeenCalledWith(
          'auth.token.interceptor.missing-token',
          jasmine.objectContaining({
            endpoint: '/api/goblins/{goblinId}/hoards/{hoardId}/shinies',
          }),
        );
        done();
      },
    });
  });
});
