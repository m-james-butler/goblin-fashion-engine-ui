export interface Shiny {
  id: string;
  count: number;
  category: string;
  subcategory: string;
  filename: string;
  primaryContext: string;
  secondaryContext: string | null;
  formality: string;
  warmth: number;
  layer: string;
  colorPrimary: string;
  colorSecondary: string | null;
  pattern: string | null;
  fabric: string | null;
  fit: string | null;
  officeOk: boolean;
  publicWear: boolean;
  imagePath: string | null;
  includeInEngine: boolean;
  status: string;
  notes: string | null;
  attentionLevel: string | null;
}
