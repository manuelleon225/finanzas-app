import { useMemo } from 'react';

import { useAccounts } from '@/features/accounts/hooks/useAccounts';
import { useRecurringRules } from '@/features/recurring/hooks/useRecurringRules';
import {
  usePendingConfirmations,
  useTransactionsInRange,
} from '@/features/transactions/hooks/useTransactions';
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
  const pendingQuery = usePendingConfirmations(from, to);

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
        status: transaction.status,
      }),
    );
    // Los gastos pendientes de confirmar reducen el disponible aunque aún no
    // estén publicados.
    const pendingExpenses = (pendingQuery.data ?? []).reduce(
      (sum, transaction) => (transaction.type === 'expense' ? sum + transaction.amount : sum),
      0,
    );

    return calculateAvailableToday({
      today: todayISO(),
      accounts,
      rules,
      pendingExpenses,
      monthTransactions,
      includeExtras: includeExtrasInAvailable,
    });
  }, [
    accountsQuery.data,
    rulesQuery.data,
    rangeQuery.data,
    pendingQuery.data,
    includeExtrasInAvailable,
  ]);

  return {
    result,
    isLoading:
      accountsQuery.isLoading ||
      rulesQuery.isLoading ||
      rangeQuery.isLoading ||
      pendingQuery.isLoading,
    isError:
      accountsQuery.isError || rulesQuery.isError || rangeQuery.isError || pendingQuery.isError,
    refetch: () => {
      void accountsQuery.refetch();
      void rulesQuery.refetch();
      void rangeQuery.refetch();
      void pendingQuery.refetch();
    },
  };
}
