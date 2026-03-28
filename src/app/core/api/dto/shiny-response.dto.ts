export interface ShinyResponseDto {
  id: string;
  goblinId: string;
  hoardId: string;

  name?: string;
  notes?: string;

  count: number;

  category: string;
  subcategory?: string;
  layer: string;

  contexts: string[];
  formality: string;
  attention: string;

  colorPrimary: string;
  colorSecondary?: string;
  pattern?: string;

  fabric?: string;
  fit?: string;

  warmth?: number;

  officeOk: boolean;
  publicWear: boolean;
  includeInEngine: boolean;
  engineInclusionPolicy: string;

  imagePath?: string;
  status: string;

  createdAt?: string;
  updatedAt?: string;
}
