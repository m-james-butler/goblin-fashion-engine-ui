import { Shiny } from './shiny.model';

export interface Hoard {
  id: string;
  name: string;
  goblinId: string;
  shinies: Shiny[];
}
