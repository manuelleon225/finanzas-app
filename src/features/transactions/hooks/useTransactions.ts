import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { TablesInsert, TablesUpdate } from '@/types/database';

import {
  createTransaction as createTransactionRequest,
  deleteTransaction as deleteTransactionRequest,
  getTransaction,
  getTransactionsInRange,
  listTransactions,
  updateTransaction as updateTransactionRequest,
  type TransactionCursor,
  type TransactionFilters,
} from '../api/transactions';

function invalidateTransactionData(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: ['transactions'] });
  void queryClient.invalidateQueries({ queryKey: ['accounts'] });
  void queryClient.invalidateQueries({ queryKey: ['summary'] });
}

export function useTransactions(filters?: TransactionFilters) {
  return useInfiniteQuery({
    queryKey: ['transactions', filters],
    initialPageParam: null as TransactionCursor | null,
    queryFn: ({ pageParam }) => listTransactions(filters, pageParam ?? undefined),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}

export function useTransaction(id?: string) {
  return useQuery({
    queryKey: ['transactions', 'detail', id],
    queryFn: () => getTransaction(id as string),
    enabled: !!id,
  });
}

export function useTransactionsInRange(from: string, to: string) {
  return useQuery({
    queryKey: ['transactions', 'range', from, to],
    queryFn: () => getTransactionsInRange(from, to),
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: TablesInsert<'transactions'>) => createTransactionRequest(input),
    onSuccess: () => invalidateTransactionData(queryClient),
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: TablesUpdate<'transactions'> }) =>
      updateTransactionRequest(id, input),
    onSuccess: () => invalidateTransactionData(queryClient),
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTransactionRequest(id),
    onSuccess: () => invalidateTransactionData(queryClient),
  });
}
