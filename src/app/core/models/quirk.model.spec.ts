import { Quirk } from './quirk.model';
import { QuirkOperator, QuirkRuleType, QuirkScopeType } from './enums';

describe('Quirk model', () => {
  it('should support quirk conditions and effect payload', () => {
    const quirk: Quirk = {
      id: 'QRK-001',
      scopeType: QuirkScopeType.GOBLIN,
      scopeId: 'GBL-001',
      name: 'No gym wear in office',
      description: 'Forbid gym-context items for office outfits',
      isActive: true,
      priority: 100,
      ruleType: QuirkRuleType.FORBID,
      conditions: {
        all: [
          { field: 'contexts', op: QuirkOperator.CONTAINS, value: 'GYM' },
          { field: 'contexts', op: QuirkOperator.CONTAINS, value: 'OFFICE' },
        ],
      },
      effect: {
        action: 'EXCLUDE_ITEM',
        targetField: 'id',
      },
      createdAt: '2026-03-15T00:00:00.000Z',
      updatedAt: '2026-03-15T00:00:00.000Z',
    };

    expect(quirk.id).toBe('QRK-001');
    expect(quirk.scopeType).toBe(QuirkScopeType.GOBLIN);
    expect(quirk.ruleType).toBe(QuirkRuleType.FORBID);
    expect(quirk.conditions.all?.length).toBe(2);
    expect(quirk.effect.action).toBe('EXCLUDE_ITEM');
  });
});