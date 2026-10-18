import { useMemo } from 'react';

import { resolveTileKey, type AccountType, type CategoryKind, type TileKey } from '@/theme';

import { hasGlyph } from './AppIcon';

export type CategoryTileSource = {
  name: string;
  kind: CategoryKind;
  icon: string;
  color?: string | null;
};

export type AccountTileSource = {
  type: AccountType;
};

export type TileDescriptor = {
  icon: string;
  tileKey: TileKey;
};

// Ícono por tipo de cuenta (v3 §3.3). "savings" usa el ícono de Piggy si existe
// en Ionicons; si no, cae al ícono de cash.
const ACCOUNT_ICON: Record<AccountType, string> = {
  cash: 'wallet',
  bank: 'business',
  savings: 'piggy-bank',
  credit_card: 'card',
};

const ACCOUNT_FALLBACK_ICON = ACCOUNT_ICON.cash;

export function resolveCategoryTile(category: CategoryTileSource): TileDescriptor {
  return {
    icon: category.icon,
    tileKey: resolveTileKey({
      name: category.name,
      kind: category.kind,
      color: category.color,
    }),
  };
}

export function resolveAccountTile(account: AccountTileSource): TileDescriptor {
  const icon = ACCOUNT_ICON[account.type];
  return {
    icon: hasGlyph(icon) ? icon : ACCOUNT_FALLBACK_ICON,
    tileKey: resolveTileKey({ type: account.type }),
  };
}

export function useCategoryTile(category: CategoryTileSource): TileDescriptor {
  return useMemo(() => resolveCategoryTile(category), [category]);
}

export function useAccountTile(account: AccountTileSource): TileDescriptor {
  return useMemo(() => resolveAccountTile(account), [account]);
}
