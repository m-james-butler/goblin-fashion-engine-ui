import { Shiny } from './shiny.model';
import {
  AttentionLevel,
  Color,
  Context,
  EngineInclusionPolicy,
  Formality,
  Layer,
  Pattern,
  ShinyCategory,
  ShinyStatus,
} from './enums';

describe('Shiny model', () => {
  it('should support the provided shiny object shape', () => {
    const shiny: Shiny = {
      id: 'SH-001',
      goblinId: 'GBL-001',
      hoardId: 'HRD-001',
      name: 'Navy Quarter Zip',
      notes: 'Reliable office layer',
      count: 1,
      category: ShinyCategory.TOP,
      subcategory: 'Sweater',
      layer: Layer.MID,
      contexts: [Context.OFFICE, Context.CASUAL],
      formality: Formality.SMART_CASUAL,
      attention: AttentionLevel.LOW,
      colorPrimary: Color.NAVY,
      colorSecondary: Color.GREY,
      pattern: Pattern.SOLID,
      fabric: 'Cotton',
      fit: 'Regular',
      warmth: 2,
      filename: 'navy-quarter-zip.jpg',
      officeOk: true,
      publicWear: true,
      includeInEngine: true,
      engineInclusionPolicy: EngineInclusionPolicy.NORMAL,
      imagePath: '/images/navy-quarter-zip.jpg',
      status: ShinyStatus.OWNED,
      createdAt: '2026-03-15T00:00:00.000Z',
      updatedAt: '2026-03-15T00:00:00.000Z',
    };

    expect(shiny.id).toBe('SH-001');
    expect(shiny.category).toBe(ShinyCategory.TOP);
    expect(shiny.contexts).toContain(Context.OFFICE);
    expect(shiny.colorSecondary).toBe(Color.GREY);
    expect(shiny.pattern).toBe(Pattern.SOLID);
    expect(shiny.includeInEngine).toBeTrue();
    expect(shiny.status).toBe(ShinyStatus.OWNED);
  });
});
