import { format, parseISO } from 'date-fns';
import { es as dateFnsEs } from 'date-fns/locale';

import type { BudgetProgressItem } from '@/features/budgets/utils/budgetProgress';
import { getNextOccurrence, type RecurrenceSpec } from '@/features/recurring/utils/recurrence';
import { es } from '@/i18n/es';

export type PlanRecurringRule = RecurrenceSpec & {
  id: string;
  is_active: boolean;
  note: string | null;
  category: { name: string } | null;
};

export function recurringSubtitle(rules: PlanRecurringRule[], today: string): string {
  let next: { name: string; date: string } | null = null;

  for (const rule of rules) {
    if (!rule.is_active) {
      continue;
    }

    const date = getNextOccurrence(rule, today);
    if (!date) {
      continue;
    }

    if (!next || date < next.date) {
      next = { name: rule.note || rule.category?.name || es.plan.recurringFallback, date };
    }
  }

  if (!next) {
    return es.plan.recurringDescription;
  }

  const label = format(parseISO(next.date), 'd MMM', { locale: dateFnsEs });

  return es.plan.recurringNext.replace('{nombre}', next.name).replace('{fecha}', label);
}

export function analysisSubtitle(insights: string[]): string {
  return insights[0] ?? es.plan.analysisDescription;
}

export function featuredBudgets(items: BudgetProgressItem[], max = 3): BudgetProgressItem[] {
  return [...items].sort((a, b) => b.ratio - a.ratio || b.spent - a.spent).slice(0, max);
}
