import { format, parseISO, subMonths } from 'date-fns';

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
