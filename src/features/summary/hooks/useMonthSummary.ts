import { useMemo } from 'react';

import { useTransactionsInRange } from '@/features/transactions/hooks/useTransactions';
import { monthRange } from '@/features/transactions/utils/transactions';

import { calculateMonthSummary } from '../utils/summary';

export function useMonthSummary(monthAnchor: Date) {
  const { from, to } = monthRange(monthAnchor);
  const rangeQuery = useTransactionsInRange(from, to);

  const summary = useMemo(() => calculateMonthSummary(rangeQuery.data ?? []), [rangeQuery.data]);

  return {
    summary,
    transactions: rangeQuery.data ?? [],
    isLoading: rangeQuery.isLoading,
    isError: rangeQuery.isError,
    refetch: () => {
      void rangeQuery.refetch();
    },
  };
}
