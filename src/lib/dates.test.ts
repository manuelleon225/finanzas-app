import { isValidISODate } from '@/lib/dates';

describe('isValidISODate', () => {
  it('acepta una fecha válida', () => {
    expect(isValidISODate('2026-06-30')).toBe(true);
  });

  it('acepta el 29 de febrero de un año bisiesto', () => {
    expect(isValidISODate('2024-02-29')).toBe(true);
  });

  it('rechaza el 29 de febrero de un año no bisiesto', () => {
    expect(isValidISODate('2023-02-29')).toBe(false);
  });

  it('rechaza un mes inexistente', () => {
    expect(isValidISODate('2026-13-01')).toBe(false);
  });

  it('rechaza un día cero', () => {
    expect(isValidISODate('2026-00-10')).toBe(false);
  });

  it('rechaza formatos sin ceros', () => {
    expect(isValidISODate('2026-6-3')).toBe(false);
  });

  it('rechaza texto vacío o basura', () => {
    expect(isValidISODate('')).toBe(false);
    expect(isValidISODate('abc')).toBe(false);
  });
});
