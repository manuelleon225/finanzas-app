import { onlineManager } from '@tanstack/react-query';
import { useSyncExternalStore } from 'react';

/** Devuelve `true` si el dispositivo tiene conexión (según `onlineManager`/NetInfo). */
export function useConnectivity(): boolean {
  return useSyncExternalStore(
    (onStoreChange) => onlineManager.subscribe(onStoreChange),
    () => onlineManager.isOnline(),
  );
}
