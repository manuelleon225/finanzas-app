import { endOfMonth, endOfYear, format, startOfMonth, startOfYear } from 'date-fns';

export type ExportRange = 'month' | 'year' | 'all';

export function exportRangeBounds(
  range: ExportRange,
  today = new Date(),
): { from: string | null; to: string | null } {
  if (range === 'month') {
    return {
      from: format(startOfMonth(today), 'yyyy-MM-dd'),
      to: format(endOfMonth(today), 'yyyy-MM-dd'),
    };
  }

  if (range === 'year') {
    return {
      from: format(startOfYear(today), 'yyyy-MM-dd'),
      to: format(endOfYear(today), 'yyyy-MM-dd'),
    };
  }

  return { from: null, to: null };
}
