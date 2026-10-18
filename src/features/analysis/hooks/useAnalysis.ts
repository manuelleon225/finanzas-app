import { useQuery } from '@tanstack/react-query';
import { endOfMonth, format, startOfMonth, subMonths } from 'date-fns';
import { useMemo } from 'react';

import { useCategories } from '@/features/categories/hooks/useCategories';

import { getTransactionsForRange } from '../api/analysis';
import {
  buildInsights,
  extraShareByMonth,
  monthlyTrend,
  spendingByCategory,
  type AnalysisKind,
  type AnalysisTransaction,
} from '../utils/analysis';

export const ANALYSIS_MONTHS = 6;

export function analysisRange(month: Date, months = ANALYSIS_MONTHS): { from: string; to: string } {
  const anchor = startOfMonth(month);
  return {
    from: format(startOfMonth(subMonths(anchor, months - 1)), 'yyyy-MM-dd'),
    to: format(endOfMonth(anchor), 'yyyy-MM-dd'),
  };
}

export function useAnalysis(month: Date, kind: AnalysisKind) {
  const { from, to } = analysisRange(month);

  const query = useQuery({
    queryKey: ['analysis', from, to],
    queryFn: () => getTransactionsForRange(from, to),
  });
  const categoriesQuery = useCategories();

  const data = useMemo(() => {
    const transactions: AnalysisTransaction[] = (query.data ?? []).map((transaction) => ({
      type: transaction.type,
      nature: transaction.nature,
      category_id: transaction.category_id,
      amount: transaction.amount,
      occurred_on: transaction.occurred_on,
      status: transaction.status,
    }));
    const categories = (categoriesQuery.data ?? []).map((category) => ({
      id: category.id,
      parent_id: category.parent_id,
      name: category.name,
      color: category.color,
      icon: category.icon,
    }));

    const monthKey = format(month, 'yyyy-MM');
    const monthTransactions = transactions.filter(
      (transaction) => transaction.occurred_on.slice(0, 7) === monthKey,
    );

    const byCategory = spendingByCategory(monthTransactions, categories, { topN: 6, kind });
    const trend = monthlyTrend(transactions, month, ANALYSIS_MONTHS);
    const extraShare = extraShareByMonth(trend);
    const insights = buildInsights({
      trend,
      topExpenses: spendingByCategory(monthTransactions, categories, { kind: 'expense' }),
    });

    return { byCategory, trend, extraShare, insights };
  }, [query.data, categoriesQuery.data, kind, month]);

  return {
    ...data,
    isLoading: query.isLoading || categoriesQuery.isLoading,
    isError: query.isError || categoriesQuery.isError,
    refetch: () => {
      void query.refetch();
      void categoriesQuery.refetch();
    },
  };
}
