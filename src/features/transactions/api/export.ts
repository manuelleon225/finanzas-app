import { format } from 'date-fns';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { supabase } from '@/lib/supabase';

import { transactionsToCsv, type CsvTransaction } from '../utils/csv';
import { exportRangeBounds, type ExportRange } from '../utils/exportRange';

export const EXPORT_PAGE_SIZE = 1000;

const SELECT =
  'id, occurred_on, type, nature, status, amount, note, recurring_rule_id, category:category_id(name, parent:parent_id(name)), account:account_id(name), transfer_account:transfer_account_id(name)';

/** Trae los movimientos publicados del rango, paginando en bloques de 1000. */
export async function fetchTransactionsForExport(
  from: string | null,
  to: string | null,
): Promise<CsvTransaction[]> {
  const all: CsvTransaction[] = [];
  let offset = 0;

  for (;;) {
    let query = supabase
      .from('transactions')
      .select(SELECT)
      .eq('status', 'posted')
      .order('occurred_on', { ascending: false })
      .order('id', { ascending: false })
      .range(offset, offset + EXPORT_PAGE_SIZE - 1);

    if (from) {
      query = query.gte('occurred_on', from);
    }
    if (to) {
      query = query.lte('occurred_on', to);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    const rows = (data ?? []) as unknown as CsvTransaction[];
    all.push(...rows);

    if (rows.length < EXPORT_PAGE_SIZE) {
      break;
    }

    offset += EXPORT_PAGE_SIZE;
  }

  return all;
}

/**
 * Genera el CSV en el directorio de caché, abre la hoja de compartir del
 * sistema y elimina el archivo temporal. Devuelve 'empty' si no hay datos.
 */
export async function exportTransactionsToCsv(
  range: ExportRange,
): Promise<{ count: number } | 'empty'> {
  const { from, to } = exportRangeBounds(range);
  const rows = await fetchTransactionsForExport(from, to);

  if (rows.length === 0) {
    return 'empty';
  }

  const csv = transactionsToCsv(rows);
  const file = new File(
    Paths.cache,
    `finanzas-movimientos-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.csv`,
  );
  file.create({ overwrite: true });
  file.write(csv);

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, {
      mimeType: 'text/csv',
      UTI: 'public.comma-separated-values-text',
    });
  }

  file.delete();

  return { count: rows.length };
}
