import { useEffect } from 'react';

import { useSession } from '@/features/auth/hooks/AuthProvider';
import { todayISO } from '@/lib/dates';

import { cancelAllReminders, scheduleReminderPlans } from '../api/reminders';
import { useReminderPrefs } from '../store/useReminderPrefs';
import { useRecurringRules } from './useRecurringRules';

export const REMINDER_HORIZON_DAYS = 30;

export function useReminderScheduling() {
  const { user, loading } = useSession();
  const remindersEnabled = useReminderPrefs((state) => state.remindersEnabled);
  const anticipationDays = useReminderPrefs((state) => state.anticipationDays);
  const { data: rules } = useRecurringRules();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user || !remindersEnabled) {
      void cancelAllReminders().catch(() => undefined);
      return;
    }

    const activeRules = (rules ?? [])
      .filter((rule) => rule.is_active && rule.type === 'expense')
      .map((rule) => ({
        id: rule.id,
        frequency: rule.frequency,
        start_date: rule.start_date,
        end_date: rule.end_date,
        amount: rule.amount,
        note: rule.note,
        categoryName: rule.category?.name ?? null,
      }));

    void scheduleReminderPlans(activeRules, {
      todayISO: todayISO(),
      horizonDays: REMINDER_HORIZON_DAYS,
      anticipationDays,
    }).catch(() => undefined);
  }, [user, loading, remindersEnabled, anticipationDays, rules]);
}
