export const DEFAULT_MAX_DIGITS = 12;

export function stripLeadingZeros(value: string): string {
  const digits = value.replace(/\D/g, '');
  return digits.replace(/^0+(?=\d)/, '');
}

/**
 * Aplica una tecla del teclado numérico a un monto en texto.
 * Acepta dígitos ('0'-'9'), '000', 'backspace'/'del' y 'clear'.
 * No permite ceros a la izquierda ni superar `maxDigits`.
 */
export function applyKey(current: string, key: string, maxDigits = DEFAULT_MAX_DIGITS): string {
  const base = stripLeadingZeros(current);

  if (key === 'backspace' || key === 'del') {
    return base.slice(0, -1);
  }

  if (key === 'clear') {
    return '';
  }

  const isTriple = key === '000';
  const isDigit = /^[0-9]$/.test(key);

  if (!isTriple && !isDigit) {
    return base;
  }

  if (base.length >= maxDigits) {
    return base;
  }

  const next = isTriple ? (base === '' ? '0' : `${base}000`) : `${base}${key}`;
  const normalized = stripLeadingZeros(next) || '0';

  if (normalized.length > maxDigits) {
    return base;
  }

  return normalized;
}
