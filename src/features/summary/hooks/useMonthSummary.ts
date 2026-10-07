import { useMemo } from 'react';

import { useRecurringRules } from '@/features/recurring/hooks/useRecurringRules';
import { useTransactionsInRange } from '@/features/transactions/hooks/useTransactions';
import { monthRange } from '@/features/transactions/utils/transactions';
import { todayISO } from '@/lib/dates';

import { calculateMonthSummary, type RecurringRuleSpec } from '../utils/summary';

export function useMonthSummary(monthAnchor: Date) {
  const { from, to } = monthRange(monthAnchor);
  const rangeQuery = useTransactionsInRange(from, to);
  const rulesQuery = useRecurringRules();

  const summary = useMemo(() => {
    const rules: RecurringRuleSpec[] = (rulesQuery.data ?? [])
      .filter((rule) => rule.is_active && rule.type === 'expense')
      .map((rule) => ({
        frequency: rule.frequency,
        start_date: rule.start_date,
        end_date: rule.end_date,
        amount: rule.amount,
      }));

    return calculateMonthSummary(rangeQuery.data ?? [], rules, todayISO());
  }, [rangeQuery.data, rulesQuery.data]);

  return {
    summary,
    transactions: rangeQuery.data ?? [],
    isLoading: rangeQuery.isLoading || rulesQuery.isLoading,
    isError: rangeQuery.isError || rulesQuery.isError,
    refetch: () => {
      void rangeQuery.refetch();
      void rulesQuery.refetch();
    },
  };
}
