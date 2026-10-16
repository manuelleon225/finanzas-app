import { onlineManager } from '@tanstack/react-query';
import { useEffect } from 'react';

import { useSession } from '@/features/auth/hooks/AuthProvider';
import { queryClient } from '@/lib/queryClient';

/**
 * Reanuda las mutaciones pausadas (creaciones offline) al iniciar con sesión y
 * cada vez que vuelve la conexión.
 */
export function useOfflineSync(): void {
  const { session } = useSession();

  useEffect(() => {
    if (!session) {
      return;
    }

    void queryClient.resumePausedMutations();

    return onlineManager.subscribe((online) => {
      if (online) {
        void queryClient.resumePausedMutations();
      }
    });
  }, [session]);
}
