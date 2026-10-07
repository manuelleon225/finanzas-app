import type { TransactionWithRelations } from '../../api/transactions';
import { formatDayHeader, monthRange, toInsertPayload } from '../transactions';

describe('monthRange', () => {
  it('devuelve el primer y último día del mes', () => {
    expect(monthRange(new Date(2026, 5, 15))).toEqual({
      from: '2026-06-01',
      to: '2026-06-30',
    });
  });

  it('maneja febrero en año bisiesto', () => {
    expect(monthRange(new Date(2024, 1, 10))).toEqual({
      from: '2024-02-01',
      to: '2024-02-29',
    });
  });
});

describe('formatDayHeader', () => {
  it('devuelve "Hoy" para la fecha de hoy', () => {
    expect(formatDayHeader('2026-06-10', '2026-06-10', '2026-06-09')).toBe('Hoy');
  });

  it('devuelve "Ayer" para la fecha de ayer', () => {
    expect(formatDayHeader('2026-06-09', '2026-06-10', '2026-06-09')).toBe('Ayer');
  });

  it('devuelve una fecha formateada para días anteriores', () => {
    const label = formatDayHeader('2026-06-08', '2026-06-10', '2026-06-09');
    expect(label).not.toBe('Hoy');
    expect(label).not.toBe('Ayer');
    expect(label.length).toBeGreaterThan(0);
  });
});

describe('toInsertPayload', () => {
  it('copia los campos relevantes del movimiento', () => {
    const transaction = {
      id: 't1',
      user_id: 'u',
      type: 'expense',
      nature: 'extra',
      amount: 5000,
      account_id: 'a1',
      transfer_account_id: null,
      category_id: 'c1',
      occurred_on: '2026-06-10',
      note: 'Café',
      recurring_rule_id: null,
      occurrence_date: null,
      created_at: '',
      updated_at: '',
      category: null,
      account: null,
      transfer_account: null,
    } as TransactionWithRelations;

    expect(toInsertPayload(transaction)).toEqual({
      type: 'expense',
      nature: 'extra',
      amount: 5000,
      account_id: 'a1',
      transfer_account_id: null,
      category_id: 'c1',
      occurred_on: '2026-06-10',
      note: 'Café',
      recurring_rule_id: null,
      occurrence_date: null,
    });
  });
});
