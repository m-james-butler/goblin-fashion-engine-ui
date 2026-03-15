import { Goblin } from './goblin.model';

describe('Goblin model', () => {
  it('should support a goblin with default hoard metadata', () => {
    const goblin: Goblin = {
      id: 'GBL-001',
      displayName: 'Snarkle',
      email: 'snarkle@goblin.fashion',
      defaultHoardId: 'HRD-001',
      createdAt: '2026-03-15T00:00:00.000Z',
      updatedAt: '2026-03-15T00:00:00.000Z',
    };

    expect(goblin.id).toBe('GBL-001');
    expect(goblin.displayName).toBe('Snarkle');
    expect(goblin.defaultHoardId).toBe('HRD-001');
    expect(goblin.email).toBe('snarkle@goblin.fashion');
  });
});
