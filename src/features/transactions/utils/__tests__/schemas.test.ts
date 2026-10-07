import { es } from '@/i18n/es';

import { transactionSchema } from '../schemas';

describe('transactionSchema', () => {
  it('acepta un ingreso válido', () => {
    const result = transactionSchema.safeParse({
      type: 'income',
      amount: 150000,
      account_id: 'a1',
      category_id: 'c1',
      nature: 'base',
      occurred_on: '2026-06-10',
    });
    expect(result.success).toBe(true);
  });

  it('rechaza un ingreso sin naturaleza', () => {
    const result = transactionSchema.safeParse({
      type: 'income',
      amount: 1000,
      account_id: 'a1',
      category_id: 'c1',
      occurred_on: '2026-06-10',
    });
    expect(result.success).toBe(false);
  });

  it('rechaza un gasto sin categoría', () => {
    const result = transactionSchema.safeParse({
      type: 'expense',
      amount: 1000,
      account_id: 'a1',
      nature: 'extra',
      occurred_on: '2026-06-10',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(es.transactions.categoryRequired);
    }
  });

  it('rechaza un monto cero o negativo', () => {
    for (const amount of [0, -100]) {
      const result = transactionSchema.safeParse({
        type: 'expense',
        amount,
        account_id: 'a1',
        category_id: 'c1',
        nature: 'base',
        occurred_on: '2026-06-10',
      });
      expect(result.success).toBe(false);
    }
  });

  it('rechaza una fecha inexistente', () => {
    const result = transactionSchema.safeParse({
      type: 'expense',
      amount: 1000,
      account_id: 'a1',
      category_id: 'c1',
      nature: 'base',
      occurred_on: '2026-02-30',
    });
    expect(result.success).toBe(false);
  });

  it('acepta una transferencia válida', () => {
    const result = transactionSchema.safeParse({
      type: 'transfer',
      amount: 50000,
      account_id: 'a1',
      transfer_account_id: 'a2',
      occurred_on: '2026-06-10',
    });
    expect(result.success).toBe(true);
  });

  it('rechaza una transferencia a la misma cuenta', () => {
    const result = transactionSchema.safeParse({
      type: 'transfer',
      amount: 50000,
      account_id: 'a1',
      transfer_account_id: 'a1',
      occurred_on: '2026-06-10',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(es.transactions.differentAccounts);
    }
  });

  it('rechaza una transferencia sin cuenta destino', () => {
    const result = transactionSchema.safeParse({
      type: 'transfer',
      amount: 50000,
      account_id: 'a1',
      occurred_on: '2026-06-10',
    });
    expect(result.success).toBe(false);
  });

  it('permite que la nota sea opcional', () => {
    const withNote = transactionSchema.safeParse({
      type: 'expense',
      amount: 1000,
      account_id: 'a1',
      category_id: 'c1',
      nature: 'base',
      occurred_on: '2026-06-10',
      note: 'Almuerzo',
    });
    expect(withNote.success).toBe(true);
  });
});
