import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';

import { AuthService } from './auth.service';
import { environment } from '../../../environments/environments';

export const authTokenInterceptor: HttpInterceptorFn = (request, next) => {
  if (!requiresBearerToken(request.url)) {
    return next(request);
  }

  const authService = inject(AuthService);
  return from(authService.getCurrentUserIdToken()).pipe(
    switchMap((idToken) => {
      if (!idToken) {
        return next(request);
      }

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
