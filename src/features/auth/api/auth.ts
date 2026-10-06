import { supabase } from '@/lib/supabase';

import { errorToMessage, translateAuthError } from '../utils/authErrors';

export type AuthCredentials = {
  email: string;
  password: string;
};

export async function signUp({ email, password }: AuthCredentials) {
  const { data, error } = await supabase.auth.signUp({ email, password });
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
}

export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) {
    throw new Error(translateAuthError(error.message));
  }
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}
