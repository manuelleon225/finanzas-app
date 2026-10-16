import * as Linking from 'expo-linking';

import { clearPersistedCache } from '@/lib/persister';
import { queryClient } from '@/lib/queryClient';
import { supabase } from '@/lib/supabase';

import { errorToMessage, translateAuthError } from '../utils/authErrors';
import type { AuthLinkSession } from '../utils/authLink';

export type AuthCredentials = {
  email: string;
  password: string;
};

// URLs de vuelta a la app. En Expo Go salen como `exp://.../--/<ruta>`; en un
// development build o app compilada, como `finanzas://<ruta>` (R6.2).
export function recoveryRedirectTo(): string {
  return Linking.createURL('/reset-password');
}

export function confirmationRedirectTo(): string {
  return Linking.createURL('/confirm-email');
}

export async function signUp({ email, password }: AuthCredentials) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: confirmationRedirectTo() },
  });
  if (error) {
    throw new Error(translateAuthError(error.message));
  }
  return data;
}

export async function signIn({ email, password }: AuthCredentials) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    throw new Error(translateAuthError(error.message));
  }
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(errorToMessage(error));
  }

  // Al cerrar sesión se limpia el caché en memoria y el persistido, incluidas
  // las mutaciones pendientes: no deben sobrevivir para otro usuario.
  queryClient.clear();
  await clearPersistedCache();
}

export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: recoveryRedirectTo(),
  });
  if (error) {
    throw new Error(translateAuthError(error.message));
  }
}

export async function resendConfirmation(email: string) {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: { emailRedirectTo: confirmationRedirectTo() },
  });
  if (error) {
    throw new Error(translateAuthError(error.message));
  }
}

export async function updatePassword(password: string) {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    throw new Error(translateAuthError(error.message));
  }
}

/**
 * Completa el flujo del enlace entrante: canja el código PKCE (o, como
 * respaldo, establece la sesión con los tokens del flujo implícito).
 */
export async function completeAuthLink(link: AuthLinkSession) {
  if (link.code) {
    const { error } = await supabase.auth.exchangeCodeForSession(link.code);
    if (error) {
      throw new Error(translateAuthError(error.message));
    }
    return;
  }

  if (link.accessToken && link.refreshToken) {
    const { error } = await supabase.auth.setSession({
      access_token: link.accessToken,
      refresh_token: link.refreshToken,
    });
    if (error) {
      throw new Error(translateAuthError(error.message));
    }
  }
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}
