import { Hoard } from './hoard.model';

describe('Hoard model', () => {
  it('should support hoard ownership and lifecycle metadata', () => {
    const hoard: Hoard = {
      id: 'HRD-001',
      goblinId: 'GBL-001',
      name: 'Main Hoard',
      description: 'Primary wardrobe inventory',
      isDefault: true,
      isActive: true,
      createdAt: '2026-03-15T00:00:00.000Z',
      updatedAt: '2026-03-15T00:00:00.000Z',
    };

    expect(hoard.id).toBe('HRD-001');
    expect(hoard.goblinId).toBe('GBL-001');
    expect(hoard.name).toBe('Main Hoard');
    expect(hoard.isDefault).toBeTrue();
    expect(hoard.isActive).toBeTrue();
  });
});
