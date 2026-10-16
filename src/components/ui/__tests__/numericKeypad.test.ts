import { applyKey, stripLeadingZeros } from '../utils/numericKeypad';

describe('stripLeadingZeros', () => {
  it('quita ceros a la izquierda', () => {
    expect(stripLeadingZeros('00012')).toBe('12');
  });

  it('deja un solo cero', () => {
    expect(stripLeadingZeros('000')).toBe('0');
    expect(stripLeadingZeros('0')).toBe('0');
  });

  it('ignora caracteres no numéricos', () => {
    expect(stripLeadingZeros('1a2')).toBe('12');
  });
});

describe('applyKey', () => {
  it('agrega un dígito', () => {
    expect(applyKey('', '5')).toBe('5');
    expect(applyKey('15', '7')).toBe('157');
  });

  it('no deja ceros a la izquierda', () => {
    expect(applyKey('', '0')).toBe('0');
    expect(applyKey('0', '5')).toBe('5');
    expect(applyKey('0', '0')).toBe('0');
  });

  it('agrega tres ceros', () => {
    expect(applyKey('15', '000')).toBe('15000');
    expect(applyKey('', '000')).toBe('0');
  });

  it('respeta maxDigits con dígitos', () => {
    expect(applyKey('123456789012', '5')).toBe('123456789012');
    expect(applyKey('123', '5', 3)).toBe('123');
  });

  it('respeta maxDigits con "000"', () => {
    expect(applyKey('123456789', '000')).toBe('123456789000');
    expect(applyKey('1234567890', '000')).toBe('1234567890');
    expect(applyKey('1', '000', 3)).toBe('1');
  });

  it('borra el último dígito', () => {
    expect(applyKey('157', 'backspace')).toBe('15');
    expect(applyKey('5', 'backspace')).toBe('');
    expect(applyKey('157', 'del')).toBe('15');
  });

  it('limpia todo', () => {
    expect(applyKey('157', 'clear')).toBe('');
  });

  it('ignora teclas desconocidas', () => {
    expect(applyKey('15', 'abc')).toBe('15');
  });
});
