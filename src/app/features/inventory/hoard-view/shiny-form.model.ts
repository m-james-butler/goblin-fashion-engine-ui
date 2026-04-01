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
} from '../../../core/models/enums';

export interface ShinyFormModel {
  name: string;
  notes: string;
  count: number;
  category: ShinyCategory;
  subcategory: string;
  layer: Layer;
  contexts: Context[];
  formality: Formality;
  attention: Attention;
  colorPrimary: Color;
  colorSecondary: '' | Color;
  pattern: '' | Pattern;
  fabric: string;
  fit: string;
  warmth: string;
  officeOk: boolean;
  publicWear: boolean;
  includeInEngine: boolean;
  engineInclusionPolicy: EngineInclusionPolicy;
  imagePathPlaceholder: string;
  status: ShinyStatus;
}
