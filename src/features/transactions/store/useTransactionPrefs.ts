import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type TransactionPrefs = {
  lastAccountId: string | null;
  setLastAccountId: (id: string) => void;
};

export const useTransactionPrefs = create<TransactionPrefs>()(
  persist(
    (set) => ({
      lastAccountId: null,
      setLastAccountId: (lastAccountId) => set({ lastAccountId }),
    }),
    {
      name: 'transaction-prefs',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
