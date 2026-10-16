import { spendingByCategory, monthlyTrend } from '@/features/analysis/utils/analysis';
import { calculateBudgetProgress } from '@/features/budgets/utils/budgetProgress';
import { calculateAvailableToday } from '@/features/summary/utils/availableToday';
import { calculateMonthSummary } from '@/features/summary/utils/summary';

import { calculateTotals } from '../transactions';

const postedExpense = { type: 'expense' as const, nature: 'base' as const, amount: 10000 };
const pendingExpense = {
  type: 'expense' as const,
  nature: 'base' as const,
  amount: 999999,
  status: 'pending' as const,
};
const pendingExpenseCategorized = {
  type: 'expense' as const,
  category_id: 'food',
  amount: 999999,
  status: 'pending' as const,
};

describe('un pendiente no altera ningún total', () => {
  it('calculateTotals', () => {
    expect(calculateTotals([postedExpense, pendingExpense])).toEqual({
      income: 0,
      expense: 10000,
      balance: -10000,
    });
  });

  it('calculateMonthSummary', () => {
    const summary = calculateMonthSummary([
      { ...postedExpense },
      { ...pendingExpense },
      { type: 'income', nature: 'base', amount: 50000, status: 'pending' },
    ]);
    expect(summary.expenseTotal).toBe(10000);
    expect(summary.incomeTotal).toBe(0);
    expect(summary.balance).toBe(-10000);
  });

  it('calculateBudgetProgress', () => {
    const progress = calculateBudgetProgress(
      [{ id: 'b', category_id: 'food', amount: 100000, is_active: true }],
      [{ id: 'food', parent_id: null, name: 'Comida', icon: 'cart-outline', color: '#000' }],
      [
        { type: 'expense', category_id: 'food', amount: 10000, status: 'posted' },
        pendingExpenseCategorized,
      ],
    );
    expect(progress.items[0].spent).toBe(10000);
  });

  it('spendingByCategory', () => {
    const categories = [{ id: 'food', parent_id: null, name: 'Comida', color: '#000' }];
    const items = spendingByCategory(
      [
        { ...postedExpense, category_id: 'food', occurred_on: '2026-10-05' },
        { ...pendingExpense, category_id: 'food', occurred_on: '2026-10-05' },
      ],
      categories,
    );
    expect(items[0].amount).toBe(10000);
  });

  it('monthlyTrend', () => {
    const trend = monthlyTrend(
      [
        { ...postedExpense, category_id: 'food', occurred_on: '2026-10-05' },
        { ...pendingExpense, category_id: 'food', occurred_on: '2026-10-05' },
      ],
      new Date(2026, 9, 1),
      6,
    );
    expect(trend[5].expense).toBe(10000);
  });

  it('calculateAvailableToday ignora el pendiente pero lo suma vía pendingExpenses', () => {
    const base = calculateAvailableToday({
      today: '2026-10-07',
      accounts: [{ balance: 100000, countsAsLiquid: true }],
      rules: [],
      monthTransactions: [
        {
          type: 'expense',
          nature: 'base',
          amount: 50000,
          occurred_on: '2026-10-07',
          status: 'pending',
        },
      ],
      includeExtras: false,
    });
    expect(base.spentToday).toBe(0);
    expect(base.availableBase).toBe(100000);

    const withPending = calculateAvailableToday({
      today: '2026-10-07',
      accounts: [{ balance: 100000, countsAsLiquid: true }],
      rules: [],
      pendingExpenses: 50000,
      monthTransactions: [],
      includeExtras: false,
    });
    expect(withPending.availableBase).toBe(50000);
  });
});
