import { useMutationState, useQueryClient } from '@tanstack/react-query';

import type { TablesInsert } from '@/types/database';

import { classifyMutationError } from '../utils/mutationError';
import { useCreateTransaction } from './useTransactions';

export type PendingTransaction = {
  mutationId: number;
  payload: TablesInsert<'transactions'>;
  failed: boolean;
};

/**
 * Lee la cola de mutaciones de creación de movimientos (sin tocar el caché de
 * la lista): las pendientes de sincronizar y las que fallaron por un error no
 * transitorio. Permite reintentar (reencola con el mismo id, idempotente) o
 * descartar (quita la mutación de la cola).
 */
export function usePendingTransactions() {
  const queryClient = useQueryClient();
  const createTransaction = useCreateTransaction();

  const mutations = useMutationState({
    filters: { mutationKey: ['transactions', 'create'], exact: true },
    select: (mutation) => ({
      mutationId: mutation.mutationId,
      status: mutation.state.status,
      payload: mutation.state.variables as TablesInsert<'transactions'> | undefined,
      error: mutation.state.error,
    }),
  });

  const pending: PendingTransaction[] = [];
  const failed: PendingTransaction[] = [];

  for (const mutation of mutations) {
    if (!mutation.payload) {
      continue;
    }

    if (mutation.status === 'pending') {
      pending.push({ mutationId: mutation.mutationId, payload: mutation.payload, failed: false });
    } else if (mutation.status === 'error') {
      if (classifyMutationError(mutation.error) === 'network') {
        // Error transitorio: se reintentará al reconectar.
        pending.push({ mutationId: mutation.mutationId, payload: mutation.payload, failed: false });
      } else {
        failed.push({ mutationId: mutation.mutationId, payload: mutation.payload, failed: true });
      }
    }
  }

  function findMutation(mutationId: number) {
    return queryClient
      .getMutationCache()
      .getAll()
      .find((mutation) => mutation.mutationId === mutationId);
  }

  function retry(mutationId: number) {
    const item =
      pending.find((entry) => entry.mutationId === mutationId) ??
      failed.find((entry) => entry.mutationId === mutationId);
    const mutation = findMutation(mutationId);

    if (mutation) {
      queryClient.getMutationCache().remove(mutation);
    }

    if (item) {
      createTransaction.mutate(item.payload);
    }
  }

  function discard(mutationId: number) {
    const mutation = findMutation(mutationId);
    if (mutation) {
      queryClient.getMutationCache().remove(mutation);
    }
  }

  return { pending, failed, retry, discard };
}
