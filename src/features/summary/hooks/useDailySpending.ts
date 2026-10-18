import { useMemo } from 'react';

import { useTransactionsInRange } from '@/features/transactions/hooks/useTransactions';
import { todayISO } from '@/lib/dates';

import { getDailyAverage, getDailySpending, shiftISODate } from '../utils/dailySpending';

const DEFAULT_DAYS = 7;

export function useDailySpending(days: number = DEFAULT_DAYS) {
  const today = todayISO();
  const from = shiftISODate(today, -(days - 1));
  const rangeQuery = useTransactionsInRange(from, today);

  const daily = useMemo(
    () => getDailySpending(rangeQuery.data ?? [], today, days),
    [rangeQuery.data, today, days],
  );
  const total = useMemo(() => daily.reduce((sum, point) => sum + point.total, 0), [daily]);
  const average = useMemo(() => getDailyAverage(daily), [daily]);

  return {
    daily,
    total,
    average,
    isLoading: rangeQuery.isLoading,
    isError: rangeQuery.isError,
    refetch: () => {
      void rangeQuery.refetch();
    },
  };
}
