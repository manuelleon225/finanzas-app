import { format, startOfMonth, subMonths } from 'date-fns';
import { es as dateFnsEs } from 'date-fns/locale';

import { es } from '@/i18n/es';

export type AnalysisKind = 'expense' | 'income';

export type AnalysisTransaction = {
  type: 'income' | 'expense' | 'transfer';
  nature: 'base' | 'extra' | null;
  category_id: string | null;
  amount: number;
  occurred_on: string;
  status?: 'posted' | 'pending';
};

export type AnalysisCategory = {
  id: string;
  parent_id: string | null;
  name: string;
  color: string;
  icon?: string | null;
};

export type CategoryFlow = {
  categoryId: string;
  name: string;
  color: string | null;
  icon: string | null;
  amount: number;
  percentage: number;
};

export type MonthlyTrendPoint = {
  key: string;
  label: string;
  income: number;
  expense: number;
  base: number;
  extra: number;
};

export type ExtraSharePoint = {
  key: string;
  label: string;
  percentage: number;
};

export const OTHERS_ID = 'others';
export const DEFAULT_TOP_N = 6;

/**
 * Agrupa el flujo por categoría raíz (las subcategorías se suman a su madre).
 * Las `topN` categorías con más monto quedan separadas y el resto se agrupa en
 * "Otros". Devuelve monto y porcentaje sobre el total.
 */
export function spendingByCategory(
  transactions: AnalysisTransaction[],
  categories: AnalysisCategory[],
  options: { topN?: number; kind?: AnalysisKind } = {},
): CategoryFlow[] {
  const kind = options.kind ?? 'expense';
  const topN = options.topN ?? DEFAULT_TOP_N;

  const byId = new Map(categories.map((category) => [category.id, category]));
  const totals = new Map<string, number>();
  let total = 0;

  for (const transaction of transactions) {
    if (transaction.type !== kind || !transaction.category_id) {
      continue;
    }
    // Los pendientes de confirmar no cuentan en el análisis.
    if (transaction.status === 'pending') {
      continue;
    }

    const category = byId.get(transaction.category_id);
    if (!category) {
      continue;
    }

    const rootId = category.parent_id ?? category.id;
    totals.set(rootId, (totals.get(rootId) ?? 0) + transaction.amount);
    total += transaction.amount;
  }

  const sorted = [...totals.entries()].sort((a, b) => b[1] - a[1]);
  const top = sorted.slice(0, topN);
  const restTotal = sorted.slice(topN).reduce((sum, [, amount]) => sum + amount, 0);

  const items: CategoryFlow[] = top.map(([rootId, amount]) => {
    const category = byId.get(rootId);
    return {
      categoryId: rootId,
      name: category?.name ?? '—',
      color: category?.color ?? null,
      icon: category?.icon ?? null,
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 0,
    };
  });

  if (restTotal > 0) {
    items.push({
      categoryId: OTHERS_ID,
      name: es.analysis.others,
      color: null,
      icon: null,
      amount: restTotal,
      percentage: total > 0 ? (restTotal / total) * 100 : 0,
    });
  }

  return items;
}

/**
 * Serie de los últimos `months` meses hasta `endMonth`. `base` y `extra`
 * corresponden a la naturaleza de los ingresos (base + extra = income).
 */
export function monthlyTrend(
  transactions: AnalysisTransaction[],
  endMonth: Date,
  months = 6,
): MonthlyTrendPoint[] {
  const end = startOfMonth(endMonth);
  const points: MonthlyTrendPoint[] = [];

  for (let index = months - 1; index >= 0; index -= 1) {
    const anchor = subMonths(end, index);
    points.push({
      key: format(anchor, 'yyyy-MM'),
      label: format(anchor, 'MMM', { locale: dateFnsEs }),
      income: 0,
      expense: 0,
      base: 0,
      extra: 0,
    });
  }

  const byKey = new Map(points.map((point, index) => [point.key, index]));

  for (const transaction of transactions) {
    // Los pendientes de confirmar no cuentan en el análisis.
    if (transaction.status === 'pending') {
      continue;
    }

    const pointIndex = byKey.get(transaction.occurred_on.slice(0, 7));
    if (pointIndex === undefined) {
      continue;
    }

    const point = points[pointIndex];

    if (transaction.type === 'income') {
      point.income += transaction.amount;
      if (transaction.nature === 'extra') {
        point.extra += transaction.amount;
      } else {
        point.base += transaction.amount;
      }
    } else if (transaction.type === 'expense') {
      point.expense += transaction.amount;
    }
  }

  return points;
}

export function extraShareByMonth(points: MonthlyTrendPoint[]): ExtraSharePoint[] {
  return points.map((point) => ({
    key: point.key,
    label: point.label,
    percentage: point.income > 0 ? Math.round((point.extra / point.income) * 100) : 0,
  }));
}

export type InsightInput = {
  trend: MonthlyTrendPoint[];
  topExpenses: CategoryFlow[];
};

export function buildInsights({ trend, topExpenses }: InsightInput): string[] {
  const insights: string[] = [];
  const current = trend[trend.length - 1];
  const previous = trend[trend.length - 2];

  if (current && previous && previous.expense > 0) {
    const change = ((current.expense - previous.expense) / previous.expense) * 100;
    if (Math.abs(change) >= 10) {
      const template = change > 0 ? es.analysis.insightMore : es.analysis.insightLess;
      insights.push(template.replace('{percent}', String(Math.round(Math.abs(change)))));
    }
  }

  const top = topExpenses[0];
  if (top && top.percentage >= 25) {
    insights.push(
      es.analysis.insightTopCategory
        .replace('{category}', top.name)
        .replace('{percent}', String(Math.round(top.percentage))),
    );
  }

  if (current && current.income > 0) {
    const extraPercent = Math.round((current.extra / current.income) * 100);
    if (extraPercent >= 10) {
      insights.push(es.analysis.insightExtras.replace('{percent}', String(extraPercent)));
    }
  }

  return insights.slice(0, 3);
}
