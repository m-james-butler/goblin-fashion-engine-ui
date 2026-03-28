import { Clutter } from './clutter.model';
import {
  Attention,
  ClutterItemRole,
  ClutterSource,
  ClutterStatus,
  Context,
} from './enums';

describe('Clutter model', () => {
  it('should support a clutter with item slots and targeting metadata', () => {
    const clutter: Clutter = {
      id: 'CLT-001',
      goblinId: 'GBL-001',
      hoardId: 'HRD-001',
      name: 'Office Smart Casual',
      description: 'Default office look',
      source: ClutterSource.ENGINE,
      status: ClutterStatus.ACTIVE,
      targetContexts: [Context.OFFICE, Context.SMART_CASUAL],
      targetAttention: Attention.LOW,
      items: [
        { shinyId: 'SH-001', role: ClutterItemRole.TOP, slotOrder: 1 },
        { shinyId: 'SH-010', role: ClutterItemRole.BOTTOM, slotOrder: 2 },
      ],
      createdAt: '2026-03-15T00:00:00.000Z',
      updatedAt: '2026-03-15T00:00:00.000Z',
    };

    expect(clutter.id).toBe('CLT-001');
    expect(clutter.status).toBe(ClutterStatus.ACTIVE);
    expect(clutter.items.length).toBe(2);
    expect(clutter.items[0].role).toBe(ClutterItemRole.TOP);
  });
});