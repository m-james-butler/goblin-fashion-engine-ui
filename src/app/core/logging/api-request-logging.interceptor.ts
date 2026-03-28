import {
  HttpErrorResponse,
  HttpEventType,
  HttpInterceptorFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { tap } from 'rxjs';

import { AppLoggerService } from './app-logger.service';

export const apiRequestLoggingInterceptor: HttpInterceptorFn = (request, next) => {
  if (!request.url.includes('/api/')) {
    return next(request);
  }

  const logger = inject(AppLoggerService);
  const startedAt = performance.now();
  const requestId = crypto.randomUUID();
  const endpoint = sanitizeEndpoint(request.urlWithParams);

  logger.debug('api.request.started', {
    requestId,
    method: request.method,
    endpoint,
    hasAuthorizationHeader: request.headers.has('Authorization'),
  });

  return next(request).pipe(
    tap({
      next: (event) => {
        if (event.type !== HttpEventType.Response) {
          return;
        }

        logger.info('api.request.succeeded', {
          requestId,
          method: request.method,
          endpoint,
          status: event.status,
          durationMs: Math.round(performance.now() - startedAt),
        });
      },
      error: (error: unknown) => {
        const status = error instanceof HttpErrorResponse ? error.status : -1;
        logger.warn('api.request.failed', {
          requestId,
          method: request.method,
          endpoint,
          status,
          durationMs: Math.round(performance.now() - startedAt),
        });
      },
    }),
  );
};

function sanitizeEndpoint(url: string): string {
  return url
    .replace(/\/goblins\/[^/]+/g, '/goblins/{goblinId}')
    .replace(/\/hoards\/[^/]+/g, '/hoards/{hoardId}')
    .replace(/\/shinies\/[^/?]+/g, '/shinies/{shinyId}');
}
