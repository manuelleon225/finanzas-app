import { es } from '@/i18n/es';

/**
 * Texto de la píldora de conexión:
 * - sin conexión: "Sin conexión" o "Sin conexión · N por sincronizar".
 * - con conexión y pendientes: "Sincronizando…".
 * - con conexión y sin pendientes: nada (null).
 */
export function connectivityText(isOnline: boolean, pendingCount: number): string | null {
  if (!isOnline) {
    return pendingCount > 0
      ? es.connectivity.offlineWithPending.replace('{count}', String(pendingCount))
      : es.connectivity.offline;
  }

  if (pendingCount > 0) {
    return es.connectivity.syncing;
  }

  return null;
}

export function pendingNoticeText(count: number): string {
  return es.connectivity.pendingNotice.replace('{count}', String(count));
}

/**
 * Inserta los movimientos pendientes al inicio del día que les corresponde
 * (crea el día si no existe) y devuelve los días ordenados de más reciente a
 * más antiguo. No toca totales: los pendientes no cuentan.
 */
export function mergePendingByDay<T>(
  days: { date: string; items: T[] }[],
  pending: { occurred_on: string; item: T }[],
): { date: string; items: T[] }[] {
  const byDate = new Map(days.map((day) => [day.date, [...day.items]]));

  for (const entry of pending) {
    const list = byDate.get(entry.occurred_on);
    if (list) {
      list.unshift(entry.item);
    } else {
      byDate.set(entry.occurred_on, [entry.item]);
    }
  }

  return [...byDate.entries()]
    .map(([date, items]) => ({ date, items }))
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}
