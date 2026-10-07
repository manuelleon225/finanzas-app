import {
  addDays,
  addMonths,
  addYears,
  differenceInCalendarDays,
  format,
  getDaysInMonth,
  parseISO,
  startOfMonth,
} from 'date-fns';

import { es } from '@/i18n/es';
import type { Enums } from '@/types/database';

export type Frequency = Enums<'frequency'>;

export type RecurrenceSpec = {
  frequency: Frequency;
  start_date: string;
  end_date: string | null;
};

function iso(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function getOccurrences(spec: RecurrenceSpec, fromDate: string, toDate: string): string[] {
  const start = parseISO(spec.start_date);
  const from = parseISO(fromDate);
  const to = parseISO(toDate);
  const end = spec.end_date ? parseISO(spec.end_date) : null;
  const limit = end && end < to ? end : to;

  if (limit < from || limit < start) {
    return [];
  }

  const result: string[] = [];

  if (spec.frequency === 'weekly' || spec.frequency === 'biweekly') {
    const interval = spec.frequency === 'weekly' ? 7 : 14;
    const diff = differenceInCalendarDays(from, start);
    const steps = diff <= 0 ? 0 : Math.ceil(diff / interval);
    let current = addDays(start, steps * interval);

    while (current <= limit) {
      result.push(iso(current));
      current = addDays(current, interval);
    }

    return result;
  }

  let cursor = startOfMonth(start);

  while (cursor <= limit) {
    const daysInMonth = getDaysInMonth(cursor);
    const days =
      spec.frequency === 'semimonthly'
        ? [15, daysInMonth]
        : [Math.min(start.getDate(), daysInMonth)];

    for (const day of days) {
      const occurrence = new Date(cursor.getFullYear(), cursor.getMonth(), day);

      if (occurrence >= start && occurrence >= from && occurrence <= limit) {
        result.push(iso(occurrence));
      }
    }

    cursor = addMonths(cursor, 1);
  }

  return result;
}

export function getNextOccurrence(spec: RecurrenceSpec, afterDate: string): string | null {
  const after = parseISO(afterDate);
  const fromDate = iso(addDays(after, 1));
  const horizon = spec.end_date ?? iso(addYears(after, 2));
  const occurrences = getOccurrences(spec, fromDate, horizon);

  return occurrences[0] ?? null;
}

export function formatFrequency(spec: RecurrenceSpec): string {
  switch (spec.frequency) {
    case 'weekly':
      return es.recurring.weekly;
    case 'biweekly':
      return es.recurring.biweekly;
    case 'semimonthly':
      return es.recurring.semimonthly;
    case 'monthly':
      return `${es.recurring.monthlyPrefix} ${parseISO(spec.start_date).getDate()}`;
    default:
      return '';
  }
}
