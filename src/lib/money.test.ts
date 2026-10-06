import { formatCOP, parseMoneyInput } from '@/lib/money';

const NBSP = '\u00a0';

describe('formatCOP', () => {
  it('formats zero', () => {
    expect(formatCOP(0)).toBe(`$${NBSP}0`);
  });

  it('formats thousands', () => {
    expect(formatCOP(1000)).toBe(`$${NBSP}1.000`);
  });

  it('formats twenty five thousand', () => {
    expect(formatCOP(25000)).toBe(`$${NBSP}25.000`);
  });

  it('formats millions', () => {
    expect(formatCOP(1000000)).toBe(`$${NBSP}1.000.000`);
  });

  it('formats hundreds of millions', () => {
    expect(formatCOP(123456789)).toBe(`$${NBSP}123.456.789`);
  });
});

describe('parseMoneyInput', () => {
  it('parses plain digits', () => {
    expect(parseMoneyInput('25000')).toBe(25000);
  });

  it('parses dot thousands separator', () => {
    expect(parseMoneyInput('25.000')).toBe(25000);
  });

  it('parses comma thousands separator', () => {
    expect(parseMoneyInput('25,000')).toBe(25000);
  });

  it('parses zero', () => {
    expect(parseMoneyInput('0')).toBe(0);
  });

  it('returns zero for invalid text', () => {
    expect(parseMoneyInput('abc')).toBe(0);
  });

  it('returns zero for empty text', () => {
    expect(parseMoneyInput('')).toBe(0);
  });

  it('ignores the currency symbol', () => {
    expect(parseMoneyInput(`$${NBSP}1.234.567`)).toBe(1234567);
  });

  it('keeps a negative sign', () => {
    expect(parseMoneyInput('-25.000')).toBe(-25000);
  });
});
