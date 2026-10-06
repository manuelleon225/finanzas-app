import { supabase } from '@/lib/supabase';
import type { Enums, TablesInsert, TablesUpdate } from '@/types/database';

export type AccountType = Enums<'account_type'>;

export type AccountWithBalance = {
  account_id: string;
  user_id: string;
  name: string;
  type: AccountType;
  initial_balance: number;
  is_archived: boolean;
  balance: number;
};

export async function listAccountsWithBalance(options: { includeArchived?: boolean } = {}) {
  let query = supabase
    .from('account_balances')
    .select('account_id, user_id, name, type, initial_balance, is_archived, balance')
    .order('name', { ascending: true });

  if (!options.includeArchived) {
    query = query.eq('is_archived', false);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data ?? []) as unknown as AccountWithBalance[];
}

export async function createAccount(input: TablesInsert<'accounts'>) {
  const { data, error } = await supabase.from('accounts').insert(input).select().single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateAccount(id: string, input: TablesUpdate<'accounts'>) {
  const { data, error } = await supabase
    .from('accounts')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function archiveAccount(id: string) {
  const { data, error } = await supabase
    .from('accounts')
    .update({ is_archived: true })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}
