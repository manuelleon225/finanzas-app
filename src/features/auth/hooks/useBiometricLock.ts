import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

import { useBiometricStore } from '../store/useBiometricStore';
import { shouldLock } from '../utils/biometrics';
import { useSession } from './AuthProvider';

export function useBiometricLock() {
  const { user, loading } = useSession();
  const biometricEnabled = useBiometricStore((state) => state.biometricEnabled);
  const lock = useBiometricStore((state) => state.lock);
  const unlock = useBiometricStore((state) => state.unlock);
  const backgroundedAt = useRef<number | null>(null);

  useEffect(() => {
    if (loading) {
      return;
    }
    if (!user) {
      unlock();
      return;
    }
    if (biometricEnabled) {
      lock();
    }
  }, [loading, user, biometricEnabled, lock, unlock]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'inactive' || nextState === 'background') {
        backgroundedAt.current = Date.now();
      } else if (nextState === 'active') {
        if (
          backgroundedAt.current != null &&
          shouldLock({
            enabled: biometricEnabled,
            backgroundedAt: backgroundedAt.current,
            now: Date.now(),
          })
        ) {
          lock();
        }
        backgroundedAt.current = null;
      }
    });

    return () => {
      subscription.remove();
    };
  }, [biometricEnabled, lock]);
}
