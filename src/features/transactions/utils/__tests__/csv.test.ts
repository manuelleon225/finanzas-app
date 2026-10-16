import { CSV_BOM, transactionsToCsv, type CsvTransaction } from '../csv';

function row(overrides: Partial<CsvTransaction> = {}): CsvTransaction {
  return {
    occurred_on: '2026-10-05',
    type: 'expense',
    nature: 'base',
    amount: 25000,
    note: null,
    recurring_rule_id: null,
    category: { name: 'Comida', parent: null },
    account: { name: 'Efectivo' },
    transfer_account: null,
    ...overrides,
  };
}

describe('transactionsToCsv', () => {
  it('incluye BOM UTF-8 y encabezados con separador punto y coma', () => {
    const csv = transactionsToCsv([]);
    expect(csv.startsWith(CSV_BOM)).toBe(true);
    expect(csv).toContain(
      'fecha;tipo;naturaleza;categoría;subcategoría;cuenta;cuenta_destino;monto;nota;recurrente',
    );
  });

  it('exporta un gasto con montos enteros y fecha YYYY-MM-DD', () => {
    const csv = transactionsToCsv([row()]);
    expect(csv).toContain('2026-10-05;Gasto;Base;Comida;;Efectivo;;25000;;No');
  });

  it('deriva categoría y subcategoría', () => {
    const csv = transactionsToCsv([
      row({ category: { name: 'Restaurantes', parent: { name: 'Comida' } } }),
    ]);
    expect(csv).toContain(';Gasto;Base;Comida;Restaurantes;');
  });

  it('escapa comillas, separadores y saltos de línea en la nota', () => {
    const csv = transactionsToCsv([
      row({ note: 'Dijo "hola"; y\nsiguió' }),
      row({ note: 'línea\r\nnueva' }),
    ]);
    expect(csv).toContain('"Dijo ""hola""; y\nsiguió"');
    expect(csv).toContain('"línea\r\nnueva"');
  });

  it('omite los movimientos pendientes', () => {
    const csv = transactionsToCsv([row(), row({ status: 'pending', note: 'no exportar' })]);
    expect(csv).not.toContain('no exportar');
    expect(csv.match(/2026-10-05/g)).toHaveLength(1);
  });

  it('exporta transferencias sin categoría y con cuenta destino', () => {
    const csv = transactionsToCsv([
      row({
        type: 'transfer',
        nature: null,
        category: null,
        transfer_account: { name: 'Banco' },
      }),
    ]);
    expect(csv).toContain('2026-10-05;Transferencia;;;;Efectivo;Banco;25000;;No');
  });

  it('marca recurrente y conserva tildes', () => {
    const csv = transactionsToCsv([row({ recurring_rule_id: 'r1', note: 'Educación' })]);
    expect(csv).toContain('Educación');
    expect(csv).toContain(';Sí');
  });
});
