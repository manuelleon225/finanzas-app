import {
  buildGeneratedRows,
  computeMissingOccurrences,
  maxOfDates,
  retroactiveStart,
} from '../generation';

describe('retroactiveStart', () => {
  it('retrocede 12 meses', () => {
    expect(retroactiveStart('2026-06-15')).toBe('2025-06-15');
  });
});

describe('maxOfDates', () => {
  it('devuelve la fecha mayor', () => {
    expect(maxOfDates('2026-01-01', '2026-03-01')).toBe('2026-03-01');
    expect(maxOfDates('2026-05-01', '2026-03-01')).toBe('2026-05-01');
  });
});

describe('computeMissingOccurrences', () => {
  const rule = {
    id: 'r1',
    frequency: 'monthly' as const,
    start_date: '2026-01-10',
    end_date: null,
  };

  it('devuelve las ocurrencias que aún no existen', () => {
    expect(computeMissingOccurrences(rule, ['2026-01-10'], '2026-01-01', '2026-03-31')).toEqual([
      '2026-02-10',
      '2026-03-10',
    ]);
  });

  it('devuelve vacío si ya están todas generadas', () => {
    expect(
      computeMissingOccurrences(
        rule,
        ['2026-01-10', '2026-02-10', '2026-03-10'],
        '2026-01-01',
        '2026-03-31',
      ),
    ).toEqual([]);
  });

  it('genera 4 movimientos para una regla mensual iniciada hace 3 meses (incluye hoy)', () => {
    const threeMonthsAgo = {
      id: 'r1',
      frequency: 'monthly' as const,
      start_date: '2026-03-15',
      end_date: null,
    };
    expect(computeMissingOccurrences(threeMonthsAgo, [], '2026-03-01', '2026-06-15')).toEqual([
      '2026-03-15',
      '2026-04-15',
      '2026-05-15',
      '2026-06-15',
    ]);
  });

  it('genera 3 movimientos si hoy aún no cae la ocurrencia del mes', () => {
    const threeMonthsAgo = {
      id: 'r1',
      frequency: 'monthly' as const,
      start_date: '2026-03-15',
      end_date: null,
    };
    expect(computeMissingOccurrences(threeMonthsAgo, [], '2026-03-01', '2026-06-14')).toEqual([
      '2026-03-15',
      '2026-04-15',
      '2026-05-15',
    ]);
  });
});

describe('buildGeneratedRows', () => {
  const baseRule = {
    id: 'r1',
    type: 'expense' as const,
    nature: 'base' as const,
    amount: 90000,
    account_id: 'acc',
    category_id: 'cat',
    note: 'Luz',
  };

  it('regla auto genera movimientos posted', () => {
    const rows = buildGeneratedRows({ ...baseRule, confirmation_mode: 'auto' }, ['2026-10-05']);
    expect(rows).toHaveLength(1);
    expect(rows[0].status).toBe('posted');
    expect(rows[0].occurrence_date).toBe('2026-10-05');
  });

  it('regla confirm genera movimientos pending', () => {
    const rows = buildGeneratedRows({ ...baseRule, confirmation_mode: 'confirm' }, [
      '2026-10-05',
      '2026-11-05',
    ]);
    expect(rows.every((row) => row.status === 'pending')).toBe(true);
    expect(rows.map((row) => row.occurrence_date)).toEqual(['2026-10-05', '2026-11-05']);
  });
});
