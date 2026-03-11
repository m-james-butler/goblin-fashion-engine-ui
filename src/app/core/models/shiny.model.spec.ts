import { Shiny } from './shiny.model';

describe('Shiny model', () => {
  it('should support the provided shiny object shape', () => {
    const shiny: Shiny = {
      id: 'SH-001',
      count: 1,
      category: 'Top',
      subcategory: 'Sweater',
      filename: 'navy-quarter-zip.jpg',
      primaryContext: 'Office',
      secondaryContext: 'Casual',
      formality: 'Smart Casual',
      warmth: 2,
      layer: 'Mid',
      colorPrimary: 'Navy',
      colorSecondary: null,
      pattern: null,
      fabric: 'Cotton',
      fit: 'Regular',
      officeOk: true,
      publicWear: true,
      imagePath: '/images/navy-quarter-zip.jpg',
      includeInEngine: true,
      status: 'Active',
      notes: 'Reliable office layer',
      attentionLevel: 'Low',
    };

    expect(shiny.id).toBe('SH-001');
    expect(shiny.category).toBe('Top');
    expect(shiny.colorSecondary).toBeNull();
    expect(shiny.pattern).toBeNull();
    expect(shiny.includeInEngine).toBeTrue();
    expect(shiny.status).toBe('Active');
  });
});
