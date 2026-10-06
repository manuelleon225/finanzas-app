import { formatCOP, isValidMoneyText, parseMoneyInput } from '@/lib/money';

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

describe('isValidMoneyText', () => {
  it('accepts empty text as zero', () => {
    expect(isValidMoneyText('')).toBe(true);
  });

  it('accepts plain digits', () => {
    expect(isValidMoneyText('25000')).toBe(true);
  });

  it('accepts thousands separators', () => {
    expect(isValidMoneyText('25.000')).toBe(true);
    expect(isValidMoneyText('25,000')).toBe(true);
  });

  it('accepts a negative value', () => {
    expect(isValidMoneyText('-25.000')).toBe(true);
  });

  it('rejects text without digits', () => {
    expect(isValidMoneyText('abc')).toBe(false);
  });

  it('rejects mixed text and digits', () => {
    expect(isValidMoneyText('1a2')).toBe(false);
  });
});
