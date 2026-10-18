import { endOfMonth, format, parseISO } from 'date-fns';

export type CashFlowTransaction = {
  type: 'income' | 'expense' | 'transfer';
  status?: 'posted' | 'pending';
  amount: number;
  occurred_on: string;
};

export type CashFlowPoint = {
  day: number;
  balance: number;
};

export type LineChartPoint = {
  x: number;
  y: number;
};

export type LineChartLayout = {
  path: string;
  areaPath: string;
  coordinates: LineChartPoint[];
  zeroY: number | null;
};

function toMonthKey(month: Date | string): string {
  if (typeof month === 'string') {
    return month.slice(0, 7);
  }
  return format(month, 'yyyy-MM');
}

function toTodayKey(today: Date | string): string {
  if (typeof today === 'string') {
    return today;
  }
  return format(today, 'yyyy-MM-dd');
}

export function cumulativeBalanceByDay({
  transactions,
  month,
  today,
}: {
  transactions: CashFlowTransaction[];
  month: Date | string;
  today: Date | string;
}): CashFlowPoint[] {
  const monthKey = toMonthKey(month);
  const todayKey = toTodayKey(today);
  const todayMonthKey = todayKey.slice(0, 7);
  const isCurrentMonth = monthKey === todayMonthKey;

  const netByDay = new Map<number, number>();
  for (const transaction of transactions) {
    if (transaction.occurred_on.slice(0, 7) !== monthKey) {
      continue;
    }
    if (transaction.type === 'transfer') {
      continue;
    }
    if (transaction.status && transaction.status !== 'posted') {
      continue;
    }

    const day = Number(transaction.occurred_on.slice(8, 10));
    const delta = transaction.type === 'income' ? transaction.amount : -transaction.amount;
    netByDay.set(day, (netByDay.get(day) ?? 0) + delta);
  }

  const monthDate = parseISO(`${monthKey}-01`);
  const lastDayOfMonth = endOfMonth(monthDate).getDate();
  const lastDay = isCurrentMonth
    ? Math.min(Number(todayKey.slice(8, 10)), lastDayOfMonth)
    : lastDayOfMonth;

  const result: CashFlowPoint[] = [];
  let cumulative = 0;
  for (let day = 1; day <= Math.max(0, lastDay); day += 1) {
    cumulative += netByDay.get(day) ?? 0;
    result.push({ day, balance: cumulative });
  }

  return result;
}

export function buildLineChartLayout({
  points,
  width,
  height,
  padding = 12,
}: {
  points: { day?: number; balance?: number; x?: number; y?: number }[];
  width: number;
  height: number;
  padding?: number;
}): LineChartLayout {
  const normalized = points.map((point) => ({
    day: point.day ?? point.x ?? 0,
    balance: point.y ?? point.balance ?? 0,
  }));

  if (normalized.length === 0 || width <= 0 || height <= 0) {
    return { path: '', areaPath: '', coordinates: [], zeroY: null };
  }

  const coordinates: LineChartPoint[] = [];
  const xMin = padding;
  const xMax = width - padding;

  if (normalized.length === 1) {
    coordinates.push({ x: (xMin + xMax) / 2, y: 0 });
  } else {
    normalized.forEach((_, index) => {
      const ratio = index / (normalized.length - 1);
      const x = xMin + ratio * (xMax - xMin);
      coordinates.push({ x, y: 0 });
    });
  }

  const balances = normalized.map((point) => point.balance);
  const minBalance = Math.min(0, ...balances);
  const maxBalance = Math.max(0, ...balances);
  let domainMin = minBalance;
  let domainMax = maxBalance;

  if (domainMax - domainMin === 0) {
    domainMin = -1;
    domainMax = 1;
  } else {
    const amplitude = domainMax - domainMin;
    domainMin -= amplitude * 0.1;
    domainMax += amplitude * 0.1;
  }

  normalized.forEach((point, index) => {
    const ratio = (point.balance - domainMin) / (domainMax - domainMin);
    coordinates[index].y = height - ratio * height;
  });

  const path = coordinates
    .map((coordinate, index) => `${index === 0 ? 'M' : 'L'} ${coordinate.x} ${coordinate.y}`)
    .join(' ');

  const zeroRatio = (0 - domainMin) / (domainMax - domainMin);
  const zeroY = zeroRatio >= 0 && zeroRatio <= 1 ? height - zeroRatio * height : null;

  const areaPath =
    coordinates.length > 0
      ? `${path} L ${coordinates[coordinates.length - 1].x} ${height} L ${coordinates[0].x} ${height} Z`
      : '';

  return { path, areaPath, coordinates, zeroY };
}

export function nearestIndex(x: number, coordinates: LineChartPoint[]): number {
  if (coordinates.length === 0) {
    return 0;
  }
  let bestIndex = 0;
  let bestDistance = Math.abs(coordinates[0].x - x);
  for (let index = 1; index < coordinates.length; index += 1) {
    const distance = Math.abs(coordinates[index].x - x);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  }
  return bestIndex;
}
