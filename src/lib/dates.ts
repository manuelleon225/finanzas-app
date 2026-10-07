import { format, isValid, parseISO } from 'date-fns';

export function isValidISODate(value: string): boolean {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = parseISO(value);

  return isValid(date) && format(date, 'yyyy-MM-dd') === value;
}

export function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd');
}
