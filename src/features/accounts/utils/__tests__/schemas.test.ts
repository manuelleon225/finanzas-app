import { es } from '@/i18n/es';

import { accountSchema } from '../schemas';

describe('accountSchema', () => {
  it('acepta una cuenta válida', () => {
    const result = accountSchema.safeParse({
      name: 'Efectivo',
      type: 'cash',
      initialBalanceText: '0',
    });
    expect(result.success).toBe(true);
  });

  it('acepta un saldo negativo (tarjeta de crédito)', () => {
    const result = accountSchema.safeParse({
      name: 'Tarjeta',
      type: 'credit_card',
      initialBalanceText: '-500.000',
    });
    expect(result.success).toBe(true);
  });

  it('rechaza sin nombre', () => {
    const result = accountSchema.safeParse({
      name: '   ',
      type: 'bank',
      initialBalanceText: '0',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(es.accounts.nameRequired);
    }
  });

  it('rechaza un saldo inválido', () => {
    const result = accountSchema.safeParse({
      name: 'Banco',
      type: 'bank',
      initialBalanceText: 'abc',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(es.accounts.invalidBalance);
    }
  });
});
