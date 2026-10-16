import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useCategories } from '@/features/categories/hooks/useCategories';
import { useTransactionsInRange } from '@/features/transactions/hooks/useTransactions';
import { monthRange } from '@/features/transactions/utils/transactions';
import type { TablesInsert, TablesUpdate } from '@/types/database';

import {
  createBudget as createBudgetRequest,
  deleteBudget as deleteBudgetRequest,
  listBudgets,
  updateBudget as updateBudgetRequest,
} from '../api/budgets';
import { calculateBudgetProgress } from '../utils/budgetProgress';

function invalidateBudgets(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: ['budgets'] });
}

export function useBudgets() {
  return useQuery({
    queryKey: ['budgets'],
    queryFn: listBudgets,
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: TablesInsert<'budgets'>) => createBudgetRequest(input),
    onSuccess: () => invalidateBudgets(queryClient),
  });
}

export function useUpdateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: TablesUpdate<'budgets'> }) =>
      updateBudgetRequest(id, input),
    onSuccess: () => invalidateBudgets(queryClient),
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteBudgetRequest(id),
    onSuccess: () => invalidateBudgets(queryClient),
  });
}

export function useBudgetProgress(month: Date) {
  const { from, to } = monthRange(month);
  const budgetsQuery = useBudgets();
  const categoriesQuery = useCategories('expense');
  const rangeQuery = useTransactionsInRange(from, to);

  const progress = useMemo(
    () =>
      calculateBudgetProgress(
        (budgetsQuery.data ?? []).map((budget) => ({
          id: budget.id,
          category_id: budget.category_id,
          amount: budget.amount,
          is_active: budget.is_active,
        })),
        (categoriesQuery.data ?? []).map((category) => ({
          id: category.id,
          parent_id: category.parent_id,
          name: category.name,
          icon: category.icon,
          color: category.color,
        })),
        (rangeQuery.data ?? []).map((transaction) => ({
          type: transaction.type,
          category_id: transaction.category_id,
          amount: transaction.amount,
          status: transaction.status,
        })),
      ),
    [budgetsQuery.data, categoriesQuery.data, rangeQuery.data],
  );

  return {
    progress,
    isLoading: budgetsQuery.isLoading || categoriesQuery.isLoading || rangeQuery.isLoading,
    isError: budgetsQuery.isError || categoriesQuery.isError || rangeQuery.isError,
    refetch: () => {
      void budgetsQuery.refetch();
      void categoriesQuery.refetch();
      void rangeQuery.refetch();
    },
  };
}
