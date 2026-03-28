import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { authTokenInterceptor } from './core/auth/auth-token.interceptor';
import { apiRequestLoggingInterceptor } from './core/logging/api-request-logging.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(withInterceptors([authTokenInterceptor, apiRequestLoggingInterceptor])),
    provideRouter(routes),
  ]
};
