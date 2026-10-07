import { addDays, format, parseISO } from 'date-fns';

import { es } from '@/i18n/es';
import { formatCOP } from '@/lib/money';

import { getOccurrences, type RecurrenceSpec } from './recurrence';

export type ReminderRule = RecurrenceSpec & {
  id: string;
  amount: number;
  note: string | null;
  categoryName: string | null;
};

export type ReminderOptions = {
  todayISO: string;
  horizonDays: number;
  anticipationDays: 0 | 1;
};

export type ReminderPlan = {
  ruleId: string;
  occurrenceDate: string;
  triggerDate: Date;
  title: string;
  body: string;
};

export function computeReminderPlans(
  rules: ReminderRule[],
  options: ReminderOptions,
): ReminderPlan[] {
  const horizonDate = format(
    addDays(parseISO(options.todayISO), options.horizonDays),
    'yyyy-MM-dd',
  );
  const plans: ReminderPlan[] = [];
  const anticipationDays = options.anticipationDays;

  for (const rule of rules) {
    const occurrences = getOccurrences(rule, options.todayISO, horizonDate);

    for (const occurrenceDate of occurrences) {
      const triggerDate = addDays(parseISO(occurrenceDate), -anticipationDays);
      triggerDate.setHours(9, 0, 0, 0);

      const label = rule.note || rule.categoryName || es.reminders.paymentFallback;
      const prefix = anticipationDays >= 1 ? es.reminders.titleTomorrow : es.reminders.titleToday;

      plans.push({
        ruleId: rule.id,
        occurrenceDate,
        triggerDate,
        title: `${prefix}${label}`,
        body: `${label} — ${formatCOP(rule.amount)}`,
      });
    }
  }

  return plans.sort((a, b) => a.triggerDate.getTime() - b.triggerDate.getTime());
}
