import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';

import { AuthService } from './auth.service';
import { environment } from '../../../environments/environments';
import { AppLoggerService } from '../logging/app-logger.service';

export const authTokenInterceptor: HttpInterceptorFn = (request, next) => {
  if (!requiresBearerToken(request.url)) {
    return next(request);
  }

  const authService = inject(AuthService);
  const logger = inject(AppLoggerService);
  const endpoint = sanitizeEndpoint(request.urlWithParams);
  return from(authService.getCurrentUserIdToken()).pipe(
    switchMap((idToken) => {
      if (!idToken) {
        logger.warn('auth.token.interceptor.missing-token', {
          method: request.method,
          endpoint,
        });
        return next(request);
      }

      logger.debug('auth.token.interceptor.attached-token', {
        method: request.method,
        endpoint,
      });
      return next(
        request.clone({
          setHeaders: {
            Authorization: `Bearer ${idToken}`,
          },
        }),
      );
    }),
  );
};

function requiresBearerToken(requestUrl: string): boolean {
  const normalizedBaseUrl = environment.apiBaseUrl.replace(/\/+$/, '');
  const normalizedRequestUrl = requestUrl.trim();
  const absoluteGoblinApiPrefix = `${normalizedBaseUrl}/api/goblins/`;

  return (
    normalizedRequestUrl.startsWith('/api/goblins/') ||
    normalizedRequestUrl.startsWith(absoluteGoblinApiPrefix)
  );
}

function sanitizeEndpoint(url: string): string {
  return url
    .replace(/\/goblins\/[^/]+/g, '/goblins/{goblinId}')
    .replace(/\/hoards\/[^/]+/g, '/hoards/{hoardId}')
    .replace(/\/shinies\/[^/?]+/g, '/shinies/{shinyId}');
}
