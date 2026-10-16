import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';

export const PERSIST_KEY = 'finanzas-query-cache';

/**
 * Persister del caché de TanStack Query en AsyncStorage. Solo guarda el estado
 * de queries y mutaciones (nunca la sesión: eso vive en el storage de Supabase).
 */
export const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: PERSIST_KEY,
  throttleTime: 1000,
});

/** Borra el caché persistido (se usa al cerrar sesión). */
export async function clearPersistedCache(): Promise<void> {
  await persister.removeClient();
}
