import { es } from '@/i18n/es';

import { accountSchema, defaultCountsAsLiquid } from '../schemas';

describe('accountSchema', () => {
  it('acepta una cuenta válida', () => {
    const result = accountSchema.safeParse({
      name: 'Efectivo',
      type: 'cash',
      initialBalanceText: '0',
      countsAsLiquid: true,
    });
    expect(result.success).toBe(true);
  });

  it('acepta un saldo negativo (tarjeta de crédito)', () => {
    const result = accountSchema.safeParse({
      name: 'Tarjeta',
      type: 'credit_card',
      initialBalanceText: '-500.000',
      countsAsLiquid: false,
    });
    expect(result.success).toBe(true);
  });

  it('rechaza sin nombre', () => {
    const result = accountSchema.safeParse({
      name: '   ',
      type: 'bank',
      initialBalanceText: '0',
      countsAsLiquid: true,
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
      countsAsLiquid: true,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(es.accounts.invalidBalance);
    }
  });
});

describe('defaultCountsAsLiquid', () => {
  it('es true para efectivo y banco', () => {
    expect(defaultCountsAsLiquid('cash')).toBe(true);
    expect(defaultCountsAsLiquid('bank')).toBe(true);
  });

  it('es false para ahorros y tarjeta de crédito', () => {
    expect(defaultCountsAsLiquid('savings')).toBe(false);
    expect(defaultCountsAsLiquid('credit_card')).toBe(false);
  });
});
