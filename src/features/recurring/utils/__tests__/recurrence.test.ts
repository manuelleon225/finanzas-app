import { formatFrequency, getNextOccurrence, getOccurrences } from '../recurrence';

describe('getOccurrences — weekly', () => {
  it('devuelve cada 7 días desde el inicio dentro del rango', () => {
    const spec = { frequency: 'weekly' as const, start_date: '2026-01-01', end_date: null };
    expect(getOccurrences(spec, '2026-01-01', '2026-01-31')).toEqual([
      '2026-01-01',
      '2026-01-08',
      '2026-01-15',
      '2026-01-22',
      '2026-01-29',
    ]);
  });

  it('calcula la primera ocurrencia cuando el rango empieza después del inicio', () => {
    const spec = { frequency: 'weekly' as const, start_date: '2026-01-01', end_date: null };
    expect(getOccurrences(spec, '2026-01-10', '2026-01-20')).toEqual(['2026-01-15']);
  });
});

describe('getOccurrences — biweekly', () => {
  it('devuelve cada 14 días', () => {
    const spec = { frequency: 'biweekly' as const, start_date: '2026-01-01', end_date: null };
    expect(getOccurrences(spec, '2026-01-01', '2026-02-28')).toEqual([
      '2026-01-01',
      '2026-01-15',
      '2026-01-29',
      '2026-02-12',
      '2026-02-26',
    ]);
  });
});

describe('getOccurrences — monthly', () => {
  it('usa el último día del mes cuando el día no existe (31)', () => {
    const spec = { frequency: 'monthly' as const, start_date: '2026-01-31', end_date: null };
    expect(getOccurrences(spec, '2026-01-01', '2026-04-30')).toEqual([
      '2026-01-31',
      '2026-02-28',
      '2026-03-31',
      '2026-04-30',
    ]);
  });

  it('respeta el día del inicio', () => {
    const spec = { frequency: 'monthly' as const, start_date: '2026-01-15', end_date: null };
    expect(getOccurrences(spec, '2026-01-01', '2026-03-31')).toEqual([
      '2026-01-15',
      '2026-02-15',
      '2026-03-15',
    ]);
  });

  it('maneja un inicio el 29 de febrero en año bisiesto', () => {
    const spec = { frequency: 'monthly' as const, start_date: '2024-02-29', end_date: null };
    expect(getOccurrences(spec, '2024-02-01', '2024-04-30')).toEqual([
      '2024-02-29',
      '2024-03-29',
      '2024-04-29',
    ]);
  });
});

describe('getOccurrences — semimonthly', () => {
  it('devuelve los días 15 y último de cada mes', () => {
    const spec = { frequency: 'semimonthly' as const, start_date: '2026-01-01', end_date: null };
    expect(getOccurrences(spec, '2026-01-01', '2026-03-31')).toEqual([
      '2026-01-15',
      '2026-01-31',
      '2026-02-15',
      '2026-02-28',
      '2026-03-15',
      '2026-03-31',
    ]);
  });

  it('no genera ocurrencias anteriores a la fecha de inicio', () => {
    const spec = { frequency: 'semimonthly' as const, start_date: '2026-01-20', end_date: null };
    expect(getOccurrences(spec, '2026-01-01', '2026-02-28')).toEqual([
      '2026-01-31',
      '2026-02-15',
      '2026-02-28',
    ]);
  });
});

describe('getOccurrences — límites', () => {
  it('respeta end_date', () => {
    const spec = {
      frequency: 'monthly' as const,
      start_date: '2026-01-10',
      end_date: '2026-03-10',
    };
    expect(getOccurrences(spec, '2026-01-01', '2026-12-31')).toEqual([
      '2026-01-10',
      '2026-02-10',
      '2026-03-10',
    ]);
  });

  it('devuelve vacío si el rango es anterior al inicio', () => {
    const spec = { frequency: 'weekly' as const, start_date: '2026-06-01', end_date: null };
    expect(getOccurrences(spec, '2026-01-01', '2026-05-31')).toEqual([]);
  });

  it('devuelve vacío si from es posterior a to', () => {
    const spec = { frequency: 'weekly' as const, start_date: '2026-01-01', end_date: null };
    expect(getOccurrences(spec, '2026-03-01', '2026-02-01')).toEqual([]);
  });
});

describe('getNextOccurrence', () => {
  it('devuelve la primera ocurrencia estrictamente posterior', () => {
    const spec = { frequency: 'monthly' as const, start_date: '2026-01-15', end_date: null };
    expect(getNextOccurrence(spec, '2026-01-10')).toBe('2026-01-15');
    expect(getNextOccurrence(spec, '2026-01-15')).toBe('2026-02-15');
  });

  it('devuelve null si no hay más ocurrencias por el fin', () => {
    const spec = {
      frequency: 'monthly' as const,
      start_date: '2026-01-10',
      end_date: '2026-01-10',
    };
    expect(getNextOccurrence(spec, '2026-01-10')).toBeNull();
  });
});

describe('formatFrequency', () => {
  it('describe la frecuencia mensual con el día', () => {
    expect(
      formatFrequency({ frequency: 'monthly', start_date: '2026-01-05', end_date: null }),
    ).toBe('Cada mes el día 5');
  });

  it('describe la quincena', () => {
    expect(
      formatFrequency({ frequency: 'semimonthly', start_date: '2026-01-01', end_date: null }),
    ).toBe('Cada quincena (15 y último)');
  });
});
