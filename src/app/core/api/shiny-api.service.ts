import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';
import { ShinyResponseDto } from './dto/shiny-response.dto';
import { AppLoggerService } from '../logging/app-logger.service';
import { ShinyCreateRequestDto } from './dto/shiny-create-request.dto';
import { ShinyUpdateRequestDto } from './dto/shiny-update-request.dto';
import { ShinyPatchRequestDto } from './dto/shiny-patch-request.dto';

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

  createShinyForGoblinAndHoard(
    goblinId: string,
    hoardId: string,
    payload: ShinyCreateRequestDto,
  ): Observable<ShinyResponseDto> {
    const endpoint = this.apiService.buildGoblinHoardShiniesPath(goblinId, hoardId);
    this.logger.debug('shiny.api.create-shiny.requested', {
      endpoint: sanitizeEndpoint(endpoint),
    });
    return this.http.post<ShinyResponseDto>(endpoint, payload);
  }

  updateShinyForGoblinAndHoard(
    goblinId: string,
    hoardId: string,
    shinyId: string,
    payload: ShinyUpdateRequestDto,
  ): Observable<ShinyResponseDto> {
    const endpoint = this.apiService.buildGoblinHoardShinyPath(goblinId, hoardId, shinyId);
    this.logger.debug('shiny.api.update-shiny.requested', {
      endpoint: sanitizeEndpoint(endpoint),
    });
    return this.http.put<ShinyResponseDto>(endpoint, payload);
  }

  patchShinyForGoblinAndHoard(
    goblinId: string,
    hoardId: string,
    shinyId: string,
    payload: ShinyPatchRequestDto,
  ): Observable<ShinyResponseDto> {
    const endpoint = this.apiService.buildGoblinHoardShinyPath(goblinId, hoardId, shinyId);
    this.logger.debug('shiny.api.patch-shiny.requested', {
      endpoint: sanitizeEndpoint(endpoint),
    });
    return this.http.patch<ShinyResponseDto>(endpoint, payload);
  }

  deleteShinyForGoblinAndHoard(
    goblinId: string,
    hoardId: string,
    shinyId: string,
  ): Observable<void> {
    const endpoint = this.apiService.buildGoblinHoardShinyPath(goblinId, hoardId, shinyId);
    this.logger.debug('shiny.api.delete-shiny.requested', {
      endpoint: sanitizeEndpoint(endpoint),
    });
    return this.http.delete<void>(endpoint);
  }
}

function sanitizeEndpoint(url: string): string {
  return url
    .replace(/\/goblins\/[^/]+/g, '/goblins/{goblinId}')
    .replace(/\/hoards\/[^/]+/g, '/hoards/{hoardId}')
    .replace(/\/shinies\/[^/?]+/g, '/shinies/{shinyId}');
}
