import { QuirkOperator, QuirkRuleType, QuirkScopeType } from './enums';

export interface Quirk {
  id: string;

  scopeType: QuirkScopeType;
  scopeId: string;

  name: string;
  description?: string;

  isActive: boolean;
  priority: number;

  ruleType: QuirkRuleType;

  conditions: QuirkConditionGroup;
  effect: QuirkEffect;

  createdAt?: string;
  updatedAt?: string;
}

export interface QuirkConditionGroup {
  all?: QuirkCondition[];
  any?: QuirkCondition[];
  none?: QuirkCondition[];
}

export interface QuirkCondition {
  field: string;
  op: QuirkOperator;
  value: unknown;
}

export interface QuirkEffect {
  action: string;
  shinyId?: string;
  targetField?: string;
  value?: unknown;
}
