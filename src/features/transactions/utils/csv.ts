import { es } from '@/i18n/es';

export type CsvTransaction = {
  occurred_on: string;
  type: 'income' | 'expense' | 'transfer';
  nature: 'base' | 'extra' | null;
  status?: 'posted' | 'pending';
  amount: number;
  note: string | null;
  recurring_rule_id: string | null;
  category: { name: string; parent: { name: string } | null } | null;
  account: { name: string } | null;
  transfer_account: { name: string } | null;
};

export const CSV_SEPARATOR = ';';
export const CSV_BOM = '\uFEFF';

const HEADERS = [
  'fecha',
  'tipo',
  'naturaleza',
  'categoría',
  'subcategoría',
  'cuenta',
  'cuenta_destino',
  'monto',
  'nota',
  'recurrente',
];

function escapeField(value: string): string {
  if (
    value.includes('"') ||
    value.includes(CSV_SEPARATOR) ||
    value.includes('\n') ||
    value.includes('\r')
  ) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function typeLabel(type: CsvTransaction['type']): string {
  if (type === 'income') {
    return es.export.typeIncome;
  }
  if (type === 'expense') {
    return es.export.typeExpense;
  }
  return es.export.typeTransfer;
}

function natureLabel(nature: CsvTransaction['nature']): string {
  if (nature === 'base') {
    return es.export.natureBase;
  }
  if (nature === 'extra') {
    return es.export.natureExtra;
  }
  return '';
}

/**
 * Convierte movimientos publicados a CSV (Excel en español): separador `;`,
 * BOM UTF-8, monto como entero sin formato y fecha YYYY-MM-DD. Los movimientos
 * `pending` se omiten. Las celdas con comillas, separadores o saltos de línea
 * se escapan entre comillas dobles.
 */
export function transactionsToCsv(rows: CsvTransaction[]): string {
  const lines = [HEADERS.join(CSV_SEPARATOR)];

  for (const row of rows) {
    if (row.status === 'pending') {
      continue;
    }

    const isTransfer = row.type === 'transfer';
    const categoryName = isTransfer
      ? ''
      : row.category?.parent
        ? row.category.parent.name
        : (row.category?.name ?? '');
    const subcategoryName = isTransfer ? '' : row.category?.parent ? row.category.name : '';

    const fields = [
      row.occurred_on,
      typeLabel(row.type),
      natureLabel(row.nature),
      categoryName,
      subcategoryName,
      row.account?.name ?? '',
      row.transfer_account?.name ?? '',
      String(row.amount),
      row.note ?? '',
      row.recurring_rule_id ? es.export.yes : es.export.no,
    ];

    lines.push(fields.map(escapeField).join(CSV_SEPARATOR));
  }

  return `${CSV_BOM}${lines.join('\r\n')}\r\n`;
}
