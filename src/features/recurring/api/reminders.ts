import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import {
  computeReminderPlans,
  type ReminderOptions,
  type ReminderRule,
} from '../utils/notifications';

export async function ensureNotificationChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Recordatorios',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
    });
  }
}

export async function cancelAllReminders() {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled.map((notification) =>
      Notifications.cancelScheduledNotificationAsync(notification.identifier),
    ),
  );
}

export async function scheduleReminderPlans(
  rules: ReminderRule[],
  options: ReminderOptions,
): Promise<number> {
  const plans = computeReminderPlans(rules, options);

  await cancelAllReminders();

  if (plans.length === 0) {
    return 0;
  }

  await ensureNotificationChannel();

  const now = Date.now();
  let scheduled = 0;

  for (const plan of plans) {
    if (plan.triggerDate.getTime() <= now) {
      continue;
    }

    await Notifications.scheduleNotificationAsync({
      content: { title: plan.title, body: plan.body, sound: 'default' },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: plan.triggerDate,
        channelId: 'default',
      },
    });

    scheduled += 1;
  }

  return scheduled;
}
