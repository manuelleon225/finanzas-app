import { endOfMonth, format, parseISO, startOfMonth } from 'date-fns';
import { es as dateFnsEs } from 'date-fns/locale';

import { es } from '@/i18n/es';
import type { TablesInsert } from '@/types/database';

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

export function monthRange(anchor: Date): { from: string; to: string } {
  return {
    from: format(startOfMonth(anchor), 'yyyy-MM-dd'),
    to: format(endOfMonth(anchor), 'yyyy-MM-dd'),
  };
}

export function formatMonthLabel(anchor: Date): string {
  return format(anchor, "MMMM 'de' yyyy", { locale: dateFnsEs });
}

export function formatDayHeader(dateISO: string, todayISO: string, yesterdayISO: string): string {
  if (dateISO === todayISO) {
    return es.transactionList.today;
  }

  if (dateISO === yesterdayISO) {
    return es.transactionList.yesterday;
  }

  return format(parseISO(dateISO), "EEE d 'de' MMM", { locale: dateFnsEs });
}

export function toInsertPayload(
  transaction: TransactionWithRelations,
): TablesInsert<'transactions'> {
  return {
    type: transaction.type,
    nature: transaction.nature,
    amount: transaction.amount,
    account_id: transaction.account_id,
    transfer_account_id: transaction.transfer_account_id,
    category_id: transaction.category_id,
    occurred_on: transaction.occurred_on,
    note: transaction.note,
    recurring_rule_id: transaction.recurring_rule_id,
    occurrence_date: transaction.occurrence_date,
  };
}
