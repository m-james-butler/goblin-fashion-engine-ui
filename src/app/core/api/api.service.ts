import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environments';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly apiBaseUrl = environment.apiBaseUrl.replace(/\/+$/, '');

  buildGoblinHoardShiniesPath(goblinId: string, hoardId: string): string {
    const encodedGoblinId = encodeURIComponent(goblinId);
    const encodedHoardId = encodeURIComponent(hoardId);
    return `${this.apiBaseUrl}/api/goblins/${encodedGoblinId}/hoards/${encodedHoardId}/shinies`;
  }
}
