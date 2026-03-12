import { Goblin } from './goblin.model';

describe('Goblin model', () => {
  it('should support a goblin with a linked hoard id', () => {
    const goblin: Goblin = {
      id: 'GBL-001',
      name: 'Snarkle',
      hoardId: 'HRD-001',
    };

    expect(goblin.id).toBe('GBL-001');
    expect(goblin.name).toBe('Snarkle');
    expect(goblin.hoardId).toBe('HRD-001');
  });
});
