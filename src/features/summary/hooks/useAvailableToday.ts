import { useMemo } from 'react';

import { useAccounts } from '@/features/accounts/hooks/useAccounts';
import { useRecurringRules } from '@/features/recurring/hooks/useRecurringRules';
import { useTransactionsInRange } from '@/features/transactions/hooks/useTransactions';
import { monthRange } from '@/features/transactions/utils/transactions';
import { todayISO } from '@/lib/dates';

import { usePreferencesStore } from '../store/usePreferencesStore';
import {
  calculateAvailableToday,
  type AvailableTodayRule,
  type AvailableTodayTransaction,
} from '../utils/availableToday';

export function useAvailableToday(month: Date) {
  const { from, to } = monthRange(month);
  const includeExtrasInAvailable = usePreferencesStore((state) => state.includeExtrasInAvailable);

  const accountsQuery = useAccounts();
  const rulesQuery = useRecurringRules();
  const rangeQuery = useTransactionsInRange(from, to);

  const result = useMemo(() => {
    const accounts = (accountsQuery.data ?? []).map((account) => ({
      balance: account.balance,
      countsAsLiquid: account.counts_as_liquid,
    }));
    const rules: AvailableTodayRule[] = (rulesQuery.data ?? []).map((rule) => ({
      type: rule.type as 'income' | 'expense',
      nature: rule.nature,
      amount: rule.amount,
      frequency: rule.frequency,
      start_date: rule.start_date,
      end_date: rule.end_date,
      is_active: rule.is_active,
    }));
    const monthTransactions: AvailableTodayTransaction[] = (rangeQuery.data ?? []).map(
      (transaction) => ({
        type: transaction.type,
        nature: transaction.nature,
        amount: transaction.amount,
        occurred_on: transaction.occurred_on,
      }),
    );

    return calculateAvailableToday({
      today: todayISO(),
      accounts,
      rules,
      pendingExpenses: 0,
      monthTransactions,
      includeExtras: includeExtrasInAvailable,
    });
  }, [accountsQuery.data, rulesQuery.data, rangeQuery.data, includeExtrasInAvailable]);

  return {
    result,
    isLoading: accountsQuery.isLoading || rulesQuery.isLoading || rangeQuery.isLoading,
    isError: accountsQuery.isError || rulesQuery.isError || rangeQuery.isError,
    refetch: () => {
      void accountsQuery.refetch();
      void rulesQuery.refetch();
      void rangeQuery.refetch();
    },
  };
}
