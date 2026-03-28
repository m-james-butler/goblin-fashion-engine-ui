import {
  Attention,
  Color,
  Context,
  EngineInclusionPolicy,
  Formality,
  Layer,
  Pattern,
  ShinyCategory,
  ShinyStatus,
} from './enums';

export interface Shiny {
  id: string;
  goblinId: string;
  hoardId: string;

  name?: string;
  notes?: string;

  count: number;

  category: ShinyCategory;
  subcategory?: string;
  layer: Layer;

  contexts: Context[];
  formality: Formality;
  attention: Attention;

  colorPrimary: Color;
  colorSecondary?: Color;
  pattern?: Pattern;

  fabric?: string;
  fit?: string;

  warmth?: number;

  officeOk: boolean;
  publicWear: boolean;
  includeInEngine: boolean;
  engineInclusionPolicy: EngineInclusionPolicy;

  imagePath?: string;
  status: ShinyStatus;

  createdAt?: string;
  updatedAt?: string;
}
