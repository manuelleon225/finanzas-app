import { es } from '@/i18n/es';

import type { AccountType } from '../api/accounts';

export type AccountSubtitleInput = {
  name: string;
  type: AccountType;
  countsAsLiquid: boolean;
};

function normalize(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Subtítulo de la fila de una cuenta (v3 §"Cuentas"). Por defecto muestra el
 * tipo en español; si el nombre coincide con el tipo, muestra si la cuenta
 * cuenta o no para "Disponible hoy".
 */
export function accountSubtitle({ name, type, countsAsLiquid }: AccountSubtitleInput): string {
  const typeLabel = es.accountTypes[type];

  if (normalize(name) === normalize(typeLabel)) {
    return countsAsLiquid ? es.accounts.countsAsLiquid : es.accounts.doesNotCountAsLiquid;
  }

  return typeLabel;
}
