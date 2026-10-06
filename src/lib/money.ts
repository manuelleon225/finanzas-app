const COP_FORMATTER = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatCOP(amount: number): string {
  return COP_FORMATTER.format(amount);
}

export function parseMoneyInput(text: string): number {
  if (typeof text !== 'string') {
    return 0;
  }

  const trimmed = text.trim();
  const isNegative = trimmed.startsWith('-');
  const digits = trimmed.replace(/\D/g, '');

  if (digits.length === 0) {
    return 0;
  }

  const value = Number.parseInt(digits, 10);

  if (Number.isNaN(value)) {
    return 0;
  }

  return isNegative ? -value : value;
}

export function isValidMoneyText(text: string): boolean {
  if (typeof text !== 'string') {
    return false;
  }

  const trimmed = text.trim();

  if (trimmed === '') {
    return true;
  }

  if (!/\d/.test(trimmed)) {
    return false;
  }

  return /^[-+]?[\d.,\s\u00a0]+$/.test(trimmed);
}
