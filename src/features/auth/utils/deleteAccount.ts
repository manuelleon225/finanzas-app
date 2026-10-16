/** Palabra que el usuario debe escribir para habilitar el botón destructivo. */
export const DELETE_CONFIRMATION_WORD = 'ELIMINAR';

/**
 * Valida la palabra de confirmación de la eliminación de cuenta.
 * Se compara sin distinguir mayúsculas y sin espacios alrededor.
 */
export function isDeleteConfirmationValid(value: string): boolean {
  return value.trim().toUpperCase() === DELETE_CONFIRMATION_WORD;
}

/**
 * Dependencias de la limpieza de estado. Se inyectan para poder probar la
 * coordinación con mocks y para no acoplar la función a los módulos nativos.
 */
export type ResetLocalStateDeps = {
  /** Cierra la sesión solo en el dispositivo (sin llamar al servidor). */
  signOutLocal: () => Promise<void>;
  /** Vacía el caché en memoria de TanStack Query (incluye la cola de mutaciones). */
  clearQueryCache: () => void;
  /** Borra el caché persistido (AsyncStorage) y las mutaciones pendientes. */
  clearPersistedCache: () => Promise<void>;
  /** Cancela las notificaciones locales programadas. */
  cancelNotifications: () => Promise<void>;
  /** Restablece los stores de Zustand (preferencias, biometría, etc.). */
  resetStores: () => void;
};

/**
 * Limpia TODO el estado local asociado al usuario. Es tolerante a fallos de los
 * efectos secundarios: aunque cerrar sesión o cancelar notificaciones falle, se
 * asegura de vaciar el caché y los stores.
 */
export async function resetLocalState(deps: ResetLocalStateDeps): Promise<void> {
  await Promise.allSettled([deps.signOutLocal(), deps.cancelNotifications()]);

  deps.clearQueryCache();
  await deps.clearPersistedCache().catch(() => undefined);

  deps.resetStores();
}
