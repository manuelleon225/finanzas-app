import type { TransactionWithRelations } from '../../api/transactions';
import { calculateTotals, groupTransactionsByDay } from '../transactions';

function makeTransaction(
  overrides: Partial<TransactionWithRelations> = {},
): TransactionWithRelations {
  return {
    id: 't' + Math.random(),
    user_id: 'u',
    type: 'expense',
    nature: 'base',
    amount: 1000,
    account_id: 'a1',
    transfer_account_id: null,
    category_id: 'c1',
    occurred_on: '2026-06-10',
    note: null,
    recurring_rule_id: null,
    occurrence_date: null,
    created_at: '',
    updated_at: '',
    category: null,
    account: null,
    transfer_account: null,
    ...overrides,
  } as TransactionWithRelations;
}

describe('calculateTotals', () => {
  it('devuelve ceros con una lista vacía', () => {
    expect(calculateTotals([])).toEqual({ income: 0, expense: 0, balance: 0 });
  });

  it('suma solo ingresos', () => {
    const totals = calculateTotals([
      makeTransaction({ type: 'income', amount: 1200 }),
      makeTransaction({ type: 'income', amount: 800 }),
    ]);
    expect(totals).toEqual({ income: 2000, expense: 0, balance: 2000 });
  });

  it('suma solo gastos', () => {
    const totals = calculateTotals([
      makeTransaction({ type: 'expense', amount: 500 }),
      makeTransaction({ type: 'expense', amount: 250 }),
    ]);
    expect(totals).toEqual({ income: 0, expense: 750, balance: -750 });
  });

  it('calcula el balance con ingresos y gastos', () => {
    const totals = calculateTotals([
      makeTransaction({ type: 'income', amount: 3000 }),
      makeTransaction({ type: 'expense', amount: 1200 }),
    ]);
    expect(totals).toEqual({ income: 3000, expense: 1200, balance: 1800 });
  });

  it('ignora las transferencias', () => {
    const totals = calculateTotals([
      makeTransaction({ type: 'transfer', amount: 9000, category_id: null, nature: null }),
      makeTransaction({ type: 'income', amount: 1000 }),
    ]);
    expect(totals).toEqual({ income: 1000, expense: 0, balance: 1000 });
  });
});

describe('groupTransactionsByDay', () => {
  it('agrupa por día ordenados de la fecha más reciente a la más antigua', () => {
    const groups = groupTransactionsByDay([
      makeTransaction({ occurred_on: '2026-06-10' }),
      makeTransaction({ occurred_on: '2026-06-11', amount: 500, type: 'income' }),
      makeTransaction({ occurred_on: '2026-06-10', amount: 300, type: 'income' }),
    ]);

    expect(groups.map((group) => group.date)).toEqual(['2026-06-11', '2026-06-10']);
    expect(groups[0].items).toHaveLength(1);
    expect(groups[1].items).toHaveLength(2);
  });

  it('calcula el total del día sin contar transferencias', () => {
    const groups = groupTransactionsByDay([
      makeTransaction({ occurred_on: '2026-06-10', amount: 5000, type: 'expense' }),
      makeTransaction({ occurred_on: '2026-06-10', amount: 2000, type: 'income' }),
      makeTransaction({
        occurred_on: '2026-06-10',
        amount: 9000,
        type: 'transfer',
        category_id: null,
        nature: null,
      }),
    ]);

    expect(groups).toHaveLength(1);
    expect(groups[0].total).toBe(-3000);
  });

  it('devuelve una lista vacía si no hay movimientos', () => {
    expect(groupTransactionsByDay([])).toEqual([]);
  });
});
