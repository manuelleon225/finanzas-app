import type { TransactionWithRelations } from '@/features/transactions/api/transactions';
import { supabase } from '@/lib/supabase';

import { hasMorePages, nextOffset } from '../utils/pagination';

export const RANGE_PAGE_SIZE = 1000;

const SELECT =
  '*, category:category_id(*), account:account_id(*), transfer_account:transfer_account_id(*)';

/**
 * Trae TODOS los movimientos del rango paginando en bloques de hasta 1000 filas
 * (el límite por defecto de PostgREST), para no truncar los 6 meses.
 */
export async function getTransactionsForRange(
  from: string,
  to: string,
): Promise<TransactionWithRelations[]> {
  const all: TransactionWithRelations[] = [];
  let offset = 0;

  for (;;) {
    const { data, error } = await supabase
      .from('transactions')
      .select(SELECT)
      .eq('status', 'posted')
      .gte('occurred_on', from)
      .lte('occurred_on', to)
      .order('occurred_on', { ascending: false })
      .order('id', { ascending: false })
      .range(offset, offset + RANGE_PAGE_SIZE - 1);

    if (error) {
      throw error;
    }

    const rows = (data ?? []) as unknown as TransactionWithRelations[];
    all.push(...rows);

    if (!hasMorePages(rows.length, RANGE_PAGE_SIZE)) {
      break;
    }

    offset = nextOffset(offset, RANGE_PAGE_SIZE);
  }

  return all;
}
