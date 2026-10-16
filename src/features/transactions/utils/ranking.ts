import { format, parseISO, subDays } from 'date-fns';

import type { Category } from '@/features/categories/api/categories';

export const USAGE_WINDOW_DAYS = 60;

export type UsageTransaction = {
  category_id: string | null;
  occurred_on: string;
};

/**
 * Ordena las categorías por uso en los últimos `USAGE_WINDOW_DAYS` días.
 * Las más usadas primero; los empates y las no usadas se ordenan por `sort_order`.
 */
export function rankCategoriesByUsage(
  transactions: UsageTransaction[],
  categories: Category[],
  today: string,
): Category[] {
  const cutoff = format(subDays(parseISO(today), USAGE_WINDOW_DAYS - 1), 'yyyy-MM-dd');
  const counts = new Map<string, number>();

  for (const transaction of transactions) {
    if (!transaction.category_id) {
      continue;
    }
    if (transaction.occurred_on < cutoff || transaction.occurred_on > today) {
      continue;
    }
    counts.set(transaction.category_id, (counts.get(transaction.category_id) ?? 0) + 1);
  }

  return [...categories].sort((a, b) => {
    const countA = counts.get(a.id) ?? 0;
    const countB = counts.get(b.id) ?? 0;

    if (countB !== countA) {
      return countB - countA;
    }

    return a.sort_order - b.sort_order;
  });
}
