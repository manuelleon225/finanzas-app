import type { TransactionWithRelations } from '@/features/transactions/api/transactions';

export type DailySpendingPoint = {
  date: string;
  total: number;
};

const DEFAULT_DAYS = 7;
const MILLIS_PER_DAY = 24 * 60 * 60 * 1000;

// Iniciales en español. El miércoles usa "X" para no confundirse con martes.
const WEEKDAY_INITIALS = ['D', 'L', 'M', 'X', 'J', 'V', 'S'] as const;

/**
 * Desplaza una fecha ISO `YYYY-MM-DD` en días, sin depender de la zona horaria.
 */
export function shiftISODate(date: string, offsetDays: number): string {
  const [year, month, day] = date.split('-').map(Number);
  const shifted = new Date(Date.UTC(year, month - 1, day) + offsetDays * MILLIS_PER_DAY);
  const yyyy = shifted.getUTCFullYear();
  const mm = String(shifted.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(shifted.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Gastos publicados por día en la ventana que termina en `today`.
 * Devuelve una fila por día (en cero si no hubo gasto), de más antiguo a más
 * reciente. Ignora ingresos, transferencias y movimientos no publicados.
 */
export function getDailySpending(
  transactions: TransactionWithRelations[],
  today: string,
  days: number = DEFAULT_DAYS,
): DailySpendingPoint[] {
  const span = Math.max(0, days);
  const start = shiftISODate(today, -(span - 1));

  const points: DailySpendingPoint[] = [];
  const indexByDate = new Map<string, number>();

  for (let i = 0; i < span; i += 1) {
    const date = shiftISODate(start, i);
    indexByDate.set(date, i);
    points.push({ date, total: 0 });
  }

  for (const transaction of transactions) {
    if (transaction.type !== 'expense' || transaction.status !== 'posted') {
      continue;
    }

    const index = indexByDate.get(transaction.occurred_on);

    if (index === undefined) {
      continue;
    }

    points[index] = { ...points[index], total: points[index].total + transaction.amount };
  }

  return points;
}

/**
 * Promedio entero (redondeado hacia abajo) del gasto por día. Los días sin
 * gasto cuentan como cero.
 */
export function getDailyAverage(daily: DailySpendingPoint[]): number {
  if (daily.length === 0) {
    return 0;
  }

  const total = daily.reduce((sum, point) => sum + point.total, 0);

  return Math.floor(total / daily.length);
}

/** Inicial del día de la semana en español (p. ej. miércoles -> "X"). */
export function getWeekdayInitial(date: string): string {
  const [year, month, day] = date.split('-').map(Number);
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();

  return WEEKDAY_INITIALS[weekday];
}
