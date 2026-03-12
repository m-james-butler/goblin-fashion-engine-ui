import { Injectable } from '@angular/core';
import { Goblin } from '../models/goblin.model';

@Injectable({
  providedIn: 'root'
})
export class GoblinService {
  private readonly loggedInGoblin: Goblin = {
    id: 'GBL-001',
    name: 'Snarkle',
    hoardId: 'HRD-001',
  };

  constructor() { }

  getLoggedInGoblinId(): string | null {
    return this.loggedInGoblin.id;
  }

  getLoggedInGoblin(): Goblin | null {
    return this.loggedInGoblin;
  }
}
