import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const secureStorage = createJSONStorage(() => ({
  getItem: (name) => SecureStore.getItemAsync(name),
  setItem: (name, value) => SecureStore.setItemAsync(name, value),
  removeItem: (name) => SecureStore.deleteItemAsync(name),
}));

type BiometricState = {
  biometricEnabled: boolean;
  isLocked: boolean;
  setBiometricEnabled: (enabled: boolean) => void;
  lock: () => void;
  unlock: () => void;
};

export const useBiometricStore = create<BiometricState>()(
  persist(
    (set) => ({
      biometricEnabled: false,
      isLocked: false,
      setBiometricEnabled: (biometricEnabled) => set({ biometricEnabled }),
      lock: () => set({ isLocked: true }),
      unlock: () => set({ isLocked: false }),
    }),
    {
      name: 'biometric-settings',
      storage: secureStorage,
      partialize: (state) => ({ biometricEnabled: state.biometricEnabled }),
    },
  ),
);
