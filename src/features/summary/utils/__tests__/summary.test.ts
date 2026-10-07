import type { TransactionWithRelations } from '../../../transactions/api/transactions';
import {
  calculateExtraDependency,
  calculateMonthSummary,
  type RecurringRuleSpec,
} from '../summary';

const today = '2026-06-10';
const rules: RecurringRuleSpec[] = [];

function makeTransaction(
  overrides: Partial<TransactionWithRelations> = {},
): TransactionWithRelations {
  return {
    id: 't',
    user_id: 'u',
    type: 'expense',
    nature: 'base',
    amount: 1000,
    account_id: 'a1',
    transfer_account_id: null,
    category_id: 'c1',
    occurred_on: '2026-06-05',
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

describe('calculateMonthSummary', () => {
  it('devuelve ceros sin movimientos ni reglas', () => {
    const summary = calculateMonthSummary([], rules, today);
    expect(summary.incomeTotal).toBe(0);
    expect(summary.expenseTotal).toBe(0);
    expect(summary.balance).toBe(0);
    expect(summary.pendingRecurringExpenses).toBe(0);
    expect(summary.availableToday).toBe(0);
    expect(summary.extraDependency).toBe(0);
  });

  it('desglosa ingresos y gastos por Base/Extra', () => {
    const summary = calculateMonthSummary(
      [
        makeTransaction({ type: 'income', nature: 'base', amount: 100000 }),
        makeTransaction({ type: 'income', nature: 'extra', amount: 50000 }),
        makeTransaction({ type: 'expense', nature: 'base', amount: 30000 }),
        makeTransaction({ type: 'expense', nature: 'extra', amount: 10000 }),
      ],
      rules,
      today,
    );
    expect(summary).toMatchObject({
      incomeTotal: 150000,
      incomeBase: 100000,
      incomeExtra: 50000,
      expenseTotal: 40000,
      expenseBase: 30000,
      expenseExtra: 10000,
      balance: 110000,
    });
  });

  it('ignora las transferencias', () => {
    const summary = calculateMonthSummary(
      [
        makeTransaction({ type: 'income', amount: 1000 }),
        makeTransaction({
          type: 'transfer',
          amount: 9000,
          category_id: null,
          nature: null,
          transfer_account_id: 'a2',
        }),
      ],
      rules,
      today,
    );
    expect(summary.incomeTotal).toBe(1000);
    expect(summary.expenseTotal).toBe(0);
  });

  it('considera los gastos recurrentes pendientes del mes (después de hoy)', () => {
    const futureRule: RecurringRuleSpec = {
      frequency: 'monthly',
      start_date: '2026-06-20',
      end_date: null,
      amount: 50000,
    };
    const summary = calculateMonthSummary([], [futureRule], today);
    expect(summary.pendingRecurringExpenses).toBe(50000);
    expect(summary.availableMonth).toBe(-50000);
    expect(summary.availableToday).toBe(0);
  });

  it('no cuenta como pendiente la ocurrencia de hoy', () => {
    const todayRule: RecurringRuleSpec = {
      frequency: 'monthly',
      start_date: today,
      end_date: null,
      amount: 50000,
    };
    const summary = calculateMonthSummary([], [todayRule], today);
    expect(summary.pendingRecurringExpenses).toBe(0);
  });

  it('divide por los días restantes contando hoy (último día = 1)', () => {
    const summary = calculateMonthSummary(
      [makeTransaction({ type: 'income', amount: 300000 })],
      rules,
      '2026-06-30',
    );
    expect(summary.daysRemaining).toBe(1);
    expect(summary.availableToday).toBe(300000);
  });

  it('nunca da disponible_hoy negativo', () => {
    const summary = calculateMonthSummary(
      [makeTransaction({ type: 'expense', amount: 100000 })],
      rules,
      today,
    );
    expect(summary.availableMonth).toBe(-100000);
    expect(summary.availableToday).toBe(0);
  });

  it('calcula la dependencia de extras', () => {
    const allExtra = calculateMonthSummary(
      [makeTransaction({ type: 'income', nature: 'extra', amount: 80000 })],
      rules,
      today,
    );
    expect(calculateExtraDependency(allExtra)).toBe(100);

    const noneExtra = calculateMonthSummary(
      [makeTransaction({ type: 'income', nature: 'base', amount: 80000 })],
      rules,
      today,
    );
    expect(calculateExtraDependency(noneExtra)).toBe(0);
  });
});
