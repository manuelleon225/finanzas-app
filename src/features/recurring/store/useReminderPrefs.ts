import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type AnticipationDays = 0 | 1;

type ReminderPrefs = {
  remindersEnabled: boolean;
  anticipationDays: AnticipationDays;
  setRemindersEnabled: (enabled: boolean) => void;
  setAnticipationDays: (days: AnticipationDays) => void;
};

export const useReminderPrefs = create<ReminderPrefs>()(
  persist(
    (set) => ({
      remindersEnabled: false,
      anticipationDays: 1,
      setRemindersEnabled: (remindersEnabled) => set({ remindersEnabled }),
      setAnticipationDays: (anticipationDays) => set({ anticipationDays }),
    }),
    {
      name: 'reminder-prefs',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
