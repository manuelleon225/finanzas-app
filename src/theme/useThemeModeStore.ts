import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ThemeModePreference = 'system' | 'dark' | 'light';

type ThemeModeState = {
  mode: ThemeModePreference;
  setMode: (mode: ThemeModePreference) => void;
};

export const useThemeModeStore = create<ThemeModeState>()(
  persist(
    (set) => ({
      mode: 'dark',
      setMode: (mode) => set({ mode }),
    }),
    {
      name: 'theme-mode',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
