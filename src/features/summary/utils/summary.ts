import { format, getDate, getDaysInMonth, parseISO } from 'date-fns';

import type { RecurrenceSpec } from '@/features/recurring/utils/recurrence';
import { getOccurrences } from '@/features/recurring/utils/recurrence';
import type { TransactionWithRelations } from '@/features/transactions/api/transactions';

export type RecurringRuleSpec = RecurrenceSpec & { amount: number };

export type MonthSummary = {
  incomeTotal: number;
  incomeBase: number;
  incomeExtra: number;
  expenseTotal: number;
  expenseBase: number;
  expenseExtra: number;
  balance: number;
  pendingRecurringExpenses: number;
  availableMonth: number;
  daysRemaining: number;
  availableToday: number;
  extraDependency: number;
};

export function calculateMonthSummary(
  transactions: TransactionWithRelations[],
  recurringExpenseRules: RecurringRuleSpec[],
  todayISO: string,
): MonthSummary {
  let incomeBase = 0;
  let incomeExtra = 0;
  let expenseBase = 0;
  let expenseExtra = 0;

  for (const transaction of transactions) {
    if (transaction.type === 'income') {
      if (transaction.nature === 'extra') {
        incomeExtra += transaction.amount;
      } else {
        incomeBase += transaction.amount;
      }
    } else if (transaction.type === 'expense') {
      if (transaction.nature === 'extra') {
        expenseExtra += transaction.amount;
      } else {
        expenseBase += transaction.amount;
      }
    }
  }

  const incomeTotal = incomeBase + incomeExtra;
  const expenseTotal = expenseBase + expenseExtra;
  const balance = incomeTotal - expenseTotal;

  const today = parseISO(todayISO);
  const afterTodayISO = format(
    new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
    'yyyy-MM-dd',
  );
  const endOfMonthISO = format(
    new Date(today.getFullYear(), today.getMonth() + 1, 0),
    'yyyy-MM-dd',
  );

  let pendingRecurringExpenses = 0;
  for (const rule of recurringExpenseRules) {
    pendingRecurringExpenses +=
      getOccurrences(rule, afterTodayISO, endOfMonthISO).length * rule.amount;
  }

  const daysRemaining = getDaysInMonth(today) - getDate(today) + 1;
  const availableMonth = incomeTotal - expenseTotal - pendingRecurringExpenses;
  const availableToday = Math.max(0, availableMonth) / daysRemaining;
  const extraDependency = incomeTotal > 0 ? Math.round((incomeExtra / incomeTotal) * 100) : 0;

  return {
    incomeTotal,
    incomeBase,
    incomeExtra,
    expenseTotal,
    expenseBase,
    expenseExtra,
    balance,
    pendingRecurringExpenses,
    availableMonth,
    daysRemaining,
    availableToday,
    extraDependency,
  };
}

export function calculateExtraDependency(summary: MonthSummary): number {
  return summary.extraDependency;
}
