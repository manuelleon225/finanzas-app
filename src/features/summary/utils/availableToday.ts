import {
  addDays,
  addMonths,
  differenceInCalendarDays,
  format,
  parseISO,
  startOfMonth,
} from 'date-fns';

import {
  getNextOccurrence,
  getOccurrences,
  type Frequency,
} from '@/features/recurring/utils/recurrence';

const iso = (date: Date) => format(date, 'yyyy-MM-dd');

export type AvailableTodayRule = {
  type: 'income' | 'expense';
  nature: 'base' | 'extra';
  amount: number;
  frequency: Frequency;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
};

export type AvailableTodayTransaction = {
  type: 'income' | 'expense' | 'transfer';
  nature: 'base' | 'extra' | null;
  amount: number;
  occurred_on: string;
};

export type AvailableTodayInput = {
  today: string;
  accounts: { balance: number; countsAsLiquid: boolean }[];
  rules: AvailableTodayRule[];
  pendingExpenses?: number;
  monthTransactions: AvailableTodayTransaction[];
  includeExtras: boolean;
};

export type AvailableTodayResult = {
  liquidBalance: number;
  committed: number;
  availableTotal: number;
  extraCushion: number;
  availableBase: number;
  daysToIncome: number;
  horizonDate: string;
  usedFallbackHorizon: boolean;
  spentToday: number;
  allowanceToday: number;
  remainingToday: number;
};

// NOTA sobre getNextOccurrence: devuelve la primera ocurrencia ESTRICTAMENTE
// posterior a la fecha dada (internamente usa after + 1 día). Esto coincide con
// lo que pide la fórmula v2 (horizonte = próxima ocurrencia de ingreso base
// posterior a hoy), por lo que no fue necesario adaptarla.
export function calculateAvailableToday(input: AvailableTodayInput): AvailableTodayResult {
  const today = input.today;
  const accounts = input.accounts;
  const rules = input.rules;
  const monthTransactions = input.monthTransactions;
  const includeExtras = input.includeExtras;
  const pendingExpenses = input.pendingExpenses ?? 0;

  const liquidBalance = accounts
    .filter((account) => account.countsAsLiquid)
    .reduce((sum, account) => sum + account.balance, 0);

  const activeBaseIncomeRules = rules.filter(
    (rule) => rule.is_active && rule.type === 'income' && rule.nature === 'base',
  );

  let horizonDate: string | null = null;
  for (const rule of activeBaseIncomeRules) {
    const next = getNextOccurrence(
      { frequency: rule.frequency, start_date: rule.start_date, end_date: rule.end_date },
      today,
    );
    if (next && (horizonDate === null || next < horizonDate)) {
      horizonDate = next;
    }
  }

  let usedFallbackHorizon = false;
  if (horizonDate === null || !horizonDate) {
    horizonDate = iso(startOfMonth(addMonths(parseISO(today), 1)));
    usedFallbackHorizon = true;
  }

  const daysToIncome = Math.max(
    1,
    differenceInCalendarDays(parseISO(horizonDate), parseISO(today)),
  );

  const tomorrow = iso(addDays(parseISO(today), 1));
  const dayBeforeHorizon = iso(addDays(parseISO(horizonDate), -1));

  let committedFromRules = 0;
  for (const rule of rules) {
    if (!rule.is_active || rule.type !== 'expense') {
      continue;
    }
    const occurrences = getOccurrences(
      { frequency: rule.frequency, start_date: rule.start_date, end_date: rule.end_date },
      tomorrow,
      dayBeforeHorizon,
    );
    committedFromRules += occurrences.length * rule.amount;
  }
  const committed = committedFromRules + pendingExpenses;

  let incomeExtra = 0;
  let expenseExtra = 0;
  let spentToday = 0;
  for (const tx of monthTransactions) {
    if (tx.type === 'income' && tx.nature === 'extra') {
      incomeExtra += tx.amount;
    } else if (tx.type === 'expense' && tx.nature === 'extra') {
      expenseExtra += tx.amount;
    }
    if (tx.type === 'expense' && tx.occurred_on === today) {
      spentToday += tx.amount;
    }
  }

  const extraCushion = Math.max(0, incomeExtra - expenseExtra);
  const availableTotal = liquidBalance - committed;
  const availableBase = includeExtras ? availableTotal : availableTotal - extraCushion;

  const allowanceToday = Math.floor(Math.max(0, availableBase + spentToday) / daysToIncome);
  const remainingToday = Math.max(0, allowanceToday - spentToday);

  return {
    liquidBalance,
    committed,
    availableTotal,
    extraCushion,
    availableBase,
    daysToIncome,
    horizonDate,
    usedFallbackHorizon,
    spentToday,
    allowanceToday,
    remainingToday,
  };
}
