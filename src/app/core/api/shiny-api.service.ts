import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';
import { ShinyResponseDto } from './dto/shiny-response.dto';
import { AppLoggerService } from '../logging/app-logger.service';

@Injectable({
  providedIn: 'root',
})
export class ShinyApiService {
  private readonly http = inject(HttpClient);
  private readonly apiService = inject(ApiService);
  private readonly logger = inject(AppLoggerService);

  getShiniesByGoblinAndHoard(
    goblinId: string,
    hoardId: string,
  ): Observable<ShinyResponseDto[]> {
    const endpoint = this.apiService.buildGoblinHoardShiniesPath(goblinId, hoardId);
    this.logger.debug('shiny.api.get-shinies.requested', {
      endpoint: sanitizeEndpoint(endpoint),
    });
    return this.http.get<ShinyResponseDto[]>(endpoint);
  }
}

function sanitizeEndpoint(url: string): string {
  return url
    .replace(/\/goblins\/[^/]+/g, '/goblins/{goblinId}')
    .replace(/\/hoards\/[^/]+/g, '/hoards/{hoardId}')
    .replace(/\/shinies\/[^/?]+/g, '/shinies/{shinyId}');
}
