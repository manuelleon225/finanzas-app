import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { AppState } from 'react-native';

import { useSession } from '@/features/auth/hooks/AuthProvider';

import { generateDueTransactions } from '../api/recurring';

export const GENERATION_COOLDOWN_MS = 60 * 60 * 1000;

let lastGeneratedAt = 0;

export function useRecurringGeneration() {
  const { user, loading } = useSession();
  const queryClient = useQueryClient();

  const run = useCallback(async () => {
    if (!user) {
      return;
    }

    const now = Date.now();
    if (now - lastGeneratedAt < GENERATION_COOLDOWN_MS) {
      return;
    }
    lastGeneratedAt = now;

    try {
      const created = await generateDueTransactions();

      if (created > 0) {
        void queryClient.invalidateQueries({ queryKey: ['transactions'] });
        void queryClient.invalidateQueries({ queryKey: ['accounts'] });
        void queryClient.invalidateQueries({ queryKey: ['summary'] });
      }
    } catch {
      lastGeneratedAt = 0;
    }
  }, [user, queryClient]);

  useEffect(() => {
    if (loading || !user) {
      return;
    }

    void run();

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void run();
      }
    });

    return () => subscription.remove();
  }, [loading, user, run]);
}
