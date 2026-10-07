import { computeMissingOccurrences, maxOfDates, retroactiveStart } from '../generation';

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
