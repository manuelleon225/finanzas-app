import { resolveTileKey, type TileKey } from '@/theme';

import type { TransactionWithRelations } from '../api/transactions';

export type MovementKind = 'income' | 'expense' | 'neutral';

export type MovementTile = {
  icon: string;
  tileKey: TileKey;
};

export type MovementRowModel = {
  tile: MovementTile;
  title: string;
  subtitle?: string;
  kind: MovementKind;
  isExtra: boolean;
  isRecurring: boolean;
};

/**
 * Modelo de presentación de una fila de movimiento (v3 §4). Función pura: no
 * toca datos ni tema; solo deriva ícono, ficha, título, subtítulo y estado.
 * Las transferencias usan ficha gris e ícono de intercambio y monto neutro.
 */
export function movementRowModel(item: TransactionWithRelations): MovementRowModel {
  const isRecurring = item.recurring_rule_id != null;

  if (item.type === 'transfer') {
    const title = `${item.account?.name ?? '?'} → ${item.transfer_account?.name ?? '?'}`;
    return {
      tile: { icon: 'swap-horizontal', tileKey: 'gray' },
      title,
      subtitle: item.note ?? undefined,
      kind: 'neutral',
      isExtra: false,
      isRecurring,
    };
  }

  const kind: MovementKind = item.type === 'income' ? 'income' : 'expense';
  const categoryName = item.category?.name ?? 'Otros';
  const subtitle = [item.category?.name, item.account?.name].filter(Boolean).join(' · ');

  return {
    tile: {
      icon: item.category?.icon ?? 'ellipsis-horizontal',
      tileKey: resolveTileKey({
        name: categoryName,
        kind: item.type === 'income' ? 'income' : 'expense',
        color: item.category?.color,
      }),
    },
    title: item.note || categoryName,
    subtitle: subtitle.length > 0 ? subtitle : undefined,
    kind,
    isExtra: item.nature === 'extra',
    isRecurring,
  };
}
