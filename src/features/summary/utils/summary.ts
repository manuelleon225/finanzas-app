import type { TransactionWithRelations } from '@/features/transactions/api/transactions';

export type MonthSummary = {
  incomeTotal: number;
  incomeBase: number;
  incomeExtra: number;
  expenseTotal: number;
  expenseBase: number;
  expenseExtra: number;
  balance: number;
  extraDependency: number;
};

export function calculateMonthSummary(transactions: TransactionWithRelations[]): MonthSummary {
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
  const extraDependency = incomeTotal > 0 ? Math.round((incomeExtra / incomeTotal) * 100) : 0;

  return {
    incomeTotal,
    incomeBase,
    incomeExtra,
    expenseTotal,
    expenseBase,
    expenseExtra,
    balance,
    extraDependency,
  };
}

export function calculateExtraDependency(summary: MonthSummary): number {
  return summary.extraDependency;
}
