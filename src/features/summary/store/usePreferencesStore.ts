import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type PreferencesState = {
  includeExtrasInAvailable: boolean;
  setIncludeExtrasInAvailable: (value: boolean) => void;
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      includeExtrasInAvailable: false,
      setIncludeExtrasInAvailable: (includeExtrasInAvailable) => set({ includeExtrasInAvailable }),
    }),
    {
      name: 'preferences',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
