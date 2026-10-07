import { es } from '@/i18n/es';

import { recurringRuleSchema } from '../schemas';

const validRule = {
  type: 'expense' as const,
  nature: 'base' as const,
  amount: 50000,
  account_id: 'a1',
  category_id: 'c1',
  frequency: 'monthly' as const,
  start_date: '2026-01-10',
  end_date: null,
};

describe('recurringRuleSchema', () => {
  it('acepta una regla válida', () => {
    expect(recurringRuleSchema.safeParse(validRule).success).toBe(true);
  });

  it('rechaza una fecha de fin anterior al inicio', () => {
    const result = recurringRuleSchema.safeParse({ ...validRule, end_date: '2025-12-31' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(es.recurring.endBeforeStart);
    }
  });

  it('rechaza un monto no positivo', () => {
    expect(recurringRuleSchema.safeParse({ ...validRule, amount: 0 }).success).toBe(false);
  });

  it('rechaza una fecha de inicio inválida', () => {
    expect(recurringRuleSchema.safeParse({ ...validRule, start_date: '2026-02-30' }).success).toBe(
      false,
    );
  });
});
