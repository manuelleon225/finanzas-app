import { queryClient } from '@/lib/queryClient';
import type { TablesInsert } from '@/types/database';

import { createTransaction } from './api/transactions';

export const CREATE_TRANSACTION_KEY = ['transactions', 'create'] as const;

/**
 * Registra los defaults de la mutación de creación de movimientos. Es lo que
 * permite reanudar las mutaciones restauradas tras reiniciar la app (las
 * funciones no se serializan, por eso hay que declararlas aquí).
 */
export function registerTransactionMutationDefaults(): void {
  queryClient.setMutationDefaults(CREATE_TRANSACTION_KEY, {
    mutationFn: (input: TablesInsert<'transactions'>) => createTransaction(input),
    networkMode: 'offlineFirst',
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['transactions'] });
      void queryClient.invalidateQueries({ queryKey: ['accounts'] });
      void queryClient.invalidateQueries({ queryKey: ['summary'] });
    },
  });
}
