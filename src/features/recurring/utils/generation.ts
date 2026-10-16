import { format, parseISO, subMonths } from 'date-fns';

import type { TablesInsert } from '@/types/database';

import { getOccurrences, type RecurrenceSpec } from './recurrence';

export const MAX_RETROACTIVE_MONTHS = 12;

export function retroactiveStart(todayISO: string, monthsBack = MAX_RETROACTIVE_MONTHS): string {
  return format(subMonths(parseISO(todayISO), monthsBack), 'yyyy-MM-dd');
}

export type GenerationSpec = RecurrenceSpec & { id: string };

export function computeMissingOccurrences(
  spec: GenerationSpec,
  existingOccurrenceDates: string[],
  fromDate: string,
  toDate: string,
): string[] {
  const existing = new Set(existingOccurrenceDates);

  return getOccurrences(spec, fromDate, toDate).filter((date) => !existing.has(date));
}

export function maxOfDates(a: string, b: string): string {
  return a >= b ? a : b;
}

export type GenerationRule = {
  id: string;
  type: 'income' | 'expense' | 'transfer';
  nature: 'base' | 'extra';
  amount: number;
  account_id: string;
  category_id: string;
  note: string | null;
  confirmation_mode: 'auto' | 'confirm';
};

/**
 * Construye las filas a insertar para una regla. Las reglas 'confirm' generan
 * movimientos 'pending' (que el usuario confirma o descarta); las 'auto'
 * generan movimientos 'posted' como antes.
 */
export function buildGeneratedRows(
  rule: GenerationRule,
  occurrenceDates: string[],
): TablesInsert<'transactions'>[] {
  return occurrenceDates.map((occurrenceDate) => ({
    type: rule.type,
    nature: rule.nature,
    status: rule.confirmation_mode === 'confirm' ? 'pending' : 'posted',
    amount: rule.amount,
    account_id: rule.account_id,
    transfer_account_id: null,
    category_id: rule.category_id,
    occurred_on: occurrenceDate,
    note: rule.note,
    recurring_rule_id: rule.id,
    occurrence_date: occurrenceDate,
  }));
}
