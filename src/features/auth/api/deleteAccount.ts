import { FunctionsFetchError } from '@supabase/supabase-js';

import { cancelAllReminders, remindersSupported } from '@/features/recurring/api/reminders';
import { useReminderPrefs } from '@/features/recurring/store/useReminderPrefs';
import { usePreferencesStore } from '@/features/summary/store/usePreferencesStore';
import { useTransactionPrefs } from '@/features/transactions/store/useTransactionPrefs';
import { clearPersistedCache } from '@/lib/persister';
import { queryClient } from '@/lib/queryClient';
import { supabase } from '@/lib/supabase';
import { useThemeModeStore } from '@/theme/useThemeModeStore';

import { useBiometricStore } from '../store/useBiometricStore';
import { resetLocalState } from '../utils/deleteAccount';

export type DeleteAccountErrorKind = 'offline' | 'server';

export class DeleteAccountError extends Error {
  readonly kind: DeleteAccountErrorKind;

  constructor(kind: DeleteAccountErrorKind) {
    super(kind);
    this.name = 'DeleteAccountError';
    this.kind = kind;
  }
}

/** Restablece todos los stores de Zustand a sus valores por defecto. */
function resetStores(): void {
  useBiometricStore.getState().unlock();
  useBiometricStore.getState().setBiometricEnabled(false);
  useReminderPrefs.getState().setRemindersEnabled(false);
  usePreferencesStore.getState().setIncludeExtrasInAvailable(false);
  useTransactionPrefs.setState({ lastAccountId: null });
  useThemeModeStore.getState().setMode('dark');
}

async function cancelNotifications(): Promise<void> {
  if (!remindersSupported()) {
    return;
  }
  await cancelAllReminders();
}

/**
 * Limpia todo el estado local del usuario: sesión, caché persistido y cola de
 * mutaciones (R5.3), stores de Zustand, flags de SecureStore (biometría) y
 * notificaciones programadas.
 */
export async function clearLocalAccountState(): Promise<void> {
  await resetLocalState({
    signOutLocal: async () => {
      await supabase.auth.signOut({ scope: 'local' });
    },
    clearQueryCache: () => {
      queryClient.clear();
    },
    clearPersistedCache,
    cancelNotifications,
    resetStores,
  });
}

function isNetworkFailure(error: unknown): boolean {
  if (error instanceof FunctionsFetchError) {
    return true;
  }
  const message = error instanceof Error ? error.message : '';
  return /network|fetch|offline|timeout/i.test(message);
}

/**
 * Elimina la cuenta del usuario en el servidor (Edge Function) y, si tiene
 * éxito, limpia todo el estado local. No cierra la sesión si la eliminación
 * falla.
 */
export async function deleteAccount(): Promise<void> {
  const { error } = await supabase.functions.invoke('delete-account', { method: 'POST' });

  if (error) {
    throw new DeleteAccountError(isNetworkFailure(error) ? 'offline' : 'server');
  }

  try {
    await clearLocalAccountState();
  } catch {
    // La cuenta ya se eliminó en el servidor: no bloqueamos al usuario por un
    // fallo al limpiar el estado local.
  }
}
