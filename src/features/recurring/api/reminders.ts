import { Platform } from 'react-native';

import {
  computeReminderPlans,
  type ReminderOptions,
  type ReminderRule,
} from '../utils/notifications';

// expo-notifications no funciona en Expo Go (SDK 53+) y lanza un error al
// importarlo. Se carga de forma diferida para no romper el arranque de la app
// en Expo Go; al usarlo (activar recordatorios) el llamador captura el error.
type NotificationsModule = typeof import('expo-notifications');

let notificationsModule: NotificationsModule | null = null;

async function getNotifications(): Promise<NotificationsModule> {
  if (!notificationsModule) {
    notificationsModule = await import('expo-notifications');
  }
  return notificationsModule;
}

export async function ensureNotificationChannel() {
  const Notifications = await getNotifications();

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Recordatorios',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
    });
  }
}

export async function cancelAllReminders() {
  const Notifications = await getNotifications();
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

  const Notifications = await getNotifications();
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
