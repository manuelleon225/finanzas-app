import NetInfo from '@react-native-community/netinfo';
import { onlineManager } from '@tanstack/react-query';

/**
 * Conecta `onlineManager` de TanStack Query con NetInfo, para que queries y
 * mutaciones se pausen/reanuden según la conectividad real del dispositivo.
 */
export function setupOnlineManager(): void {
  onlineManager.setEventListener((setOnline) =>
    NetInfo.addEventListener((state) => {
      setOnline(Boolean(state.isConnected));
    }),
  );
}
