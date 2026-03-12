import { Hoard } from './hoard.model';

describe('Hoard model', () => {
  it('should support a hoard with goblin ownership and shinies', () => {
    const hoard: Hoard = {
      id: 'HRD-001',
      name: 'Office Rotation',
      goblinId: 'GBL-001',
      shinies: [
        {
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
          imagePath: '/resources/images/Shirts/navy-quarter-zip.jpg',
          includeInEngine: true,
          status: 'Active',
          notes: 'Reliable office layer',
          attentionLevel: 'Low',
        },
      ],
    };

    expect(hoard.id).toBe('HRD-001');
    expect(hoard.name).toBe('Office Rotation');
    expect(hoard.goblinId).toBe('GBL-001');
    expect(hoard.shinies.length).toBe(1);
    expect(hoard.shinies[0].id).toBe('SH-001');
  });
});
