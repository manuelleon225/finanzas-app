import type { TransactionWithRelations } from '@/features/transactions/api/transactions';

import {
  getDailyAverage,
  getDailySpending,
  getWeekdayInitial,
  shiftISODate,
} from '../dailySpending';

function makeTransaction(
  overrides: Partial<TransactionWithRelations> = {},
): TransactionWithRelations {
  return {
    id: 't',
    user_id: 'u',
    type: 'expense',
    nature: 'base',
    status: 'posted',
    amount: 1000,
    account_id: 'a1',
    transfer_account_id: null,
    category_id: 'c1',
    occurred_on: '2026-10-07',
    note: null,
    recurring_rule_id: null,
    occurrence_date: null,
    created_at: '',
    updated_at: '',
    category: null,
    account: null,
    transfer_account: null,
    ...overrides,
  } as TransactionWithRelations;
}

describe('shiftISODate', () => {
  it('cruza el fin de mes', () => {
    expect(shiftISODate('2026-03-02', -1)).toBe('2026-03-01');
    expect(shiftISODate('2026-03-31', 1)).toBe('2026-04-01');
  });

  it('cruza el fin de año', () => {
    expect(shiftISODate('2026-01-02', -6)).toBe('2025-12-27');
    expect(shiftISODate('2025-12-31', 1)).toBe('2026-01-01');
  });
});

describe('getDailySpending', () => {
  it('devuelve siete días en cero, de más antiguo a más reciente', () => {
    const daily = getDailySpending([], '2026-10-07');

    expect(daily).toHaveLength(7);
    expect(daily.map((point) => point.date)).toEqual([
      '2026-10-01',
      '2026-10-02',
      '2026-10-03',
      '2026-10-04',
      '2026-10-05',
      '2026-10-06',
      '2026-10-07',
    ]);
    expect(daily.every((point) => point.total === 0)).toBe(true);
  });

  it('suma los gastos de un mismo día', () => {
    const daily = getDailySpending(
      [
        makeTransaction({ occurred_on: '2026-10-07', amount: 15000 }),
        makeTransaction({ occurred_on: '2026-10-07', amount: 5000 }),
      ],
      '2026-10-07',
    );

    const today = daily.find((point) => point.date === '2026-10-07');
    expect(today?.total).toBe(20000);
    expect(daily.filter((point) => point.total > 0)).toHaveLength(1);
  });

  it('ignora ingresos y transferencias', () => {
    const daily = getDailySpending(
      [
        makeTransaction({ type: 'income', amount: 900000, occurred_on: '2026-10-05' }),
        makeTransaction({ type: 'transfer', amount: 400000, occurred_on: '2026-10-06' }),
        makeTransaction({ type: 'expense', amount: 3000, occurred_on: '2026-10-05' }),
      ],
      '2026-10-07',
    );

    const spending = daily.filter((point) => point.total > 0);
    expect(spending).toHaveLength(1);
    expect(spending[0]).toEqual({ date: '2026-10-05', total: 3000 });
  });

  it('ignora movimientos no publicados', () => {
    const daily = getDailySpending(
      [
        makeTransaction({ status: 'pending', amount: 8000, occurred_on: '2026-10-04' }),
        makeTransaction({ status: 'posted', amount: 2000, occurred_on: '2026-10-04' }),
      ],
      '2026-10-07',
    );

    const day = daily.find((point) => point.date === '2026-10-04');
    expect(day?.total).toBe(2000);
  });

  it('ignora movimientos fuera de la ventana', () => {
    const daily = getDailySpending(
      [makeTransaction({ amount: 9999, occurred_on: '2026-09-30' })],
      '2026-10-07',
    );

    expect(daily.every((point) => point.total === 0)).toBe(true);
  });

  it('respeta el número de días pedido', () => {
    const daily = getDailySpending([], '2026-10-07', 3);

    expect(daily.map((point) => point.date)).toEqual(['2026-10-05', '2026-10-06', '2026-10-07']);
  });
});

describe('getDailyAverage', () => {
  it('promedia incluyendo los días en cero', () => {
    const daily = getDailySpending(
      [makeTransaction({ amount: 14000, occurred_on: '2026-10-07' })],
      '2026-10-07',
    );

    expect(getDailyAverage(daily)).toBe(2000);
  });

  it('redondea hacia abajo', () => {
    expect(
      getDailyAverage([
        { date: '2026-10-06', total: 1000 },
        { date: '2026-10-07', total: 1000 },
      ]),
    ).toBe(1000);
  });

  it('devuelve cero sin días', () => {
    expect(getDailyAverage([])).toBe(0);
  });
});

describe('getWeekdayInitial', () => {
  it('usa iniciales en español con X para miércoles', () => {
    expect(getWeekdayInitial('2026-10-05')).toBe('L');
    expect(getWeekdayInitial('2026-10-06')).toBe('M');
    expect(getWeekdayInitial('2026-10-07')).toBe('X');
    expect(getWeekdayInitial('2026-10-08')).toBe('J');
    expect(getWeekdayInitial('2026-10-09')).toBe('V');
    expect(getWeekdayInitial('2026-10-10')).toBe('S');
    expect(getWeekdayInitial('2026-10-11')).toBe('D');
  });
});
