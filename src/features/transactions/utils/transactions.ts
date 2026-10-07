import type { TransactionWithRelations } from '../api/transactions';

export type DayGroup = {
  date: string;
  total: number;
  items: TransactionWithRelations[];
};

export type TransactionTotals = {
  income: number;
  expense: number;
  balance: number;
};

export function calculateTotals(transactions: TransactionWithRelations[]): TransactionTotals {
  let income = 0;
  let expense = 0;

  for (const transaction of transactions) {
    if (transaction.type === 'income') {
      income += transaction.amount;
    } else if (transaction.type === 'expense') {
      expense += transaction.amount;
    }
  }

  return { income, expense, balance: income - expense };
}

export function groupTransactionsByDay(transactions: TransactionWithRelations[]): DayGroup[] {
  const byDay = new Map<string, TransactionWithRelations[]>();

  for (const transaction of transactions) {
    const items = byDay.get(transaction.occurred_on) ?? [];
    items.push(transaction);
    byDay.set(transaction.occurred_on, items);
  }

  return [...byDay.entries()]
    .sort(([dateA], [dateB]) => (dateA < dateB ? 1 : dateA > dateB ? -1 : 0))
    .map(([date, items]) => {
      const totals = calculateTotals(items);
      return { date, total: totals.balance, items };
    });
}
