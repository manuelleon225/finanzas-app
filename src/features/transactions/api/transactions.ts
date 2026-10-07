import { supabase } from '@/lib/supabase';
import type { Enums, Tables, TablesInsert, TablesUpdate } from '@/types/database';

export type Transaction = Tables<'transactions'>;
export type TransactionType = Enums<'transaction_type'>;
export type Nature = Enums<'nature'>;
export type Category = Tables<'categories'>;
export type Account = Tables<'accounts'>;

export type TransactionWithRelations = Transaction & {
  category: Category | null;
  account: Account | null;
  transfer_account: Account | null;
};

export const TRANSACTIONS_PAGE_SIZE = 20;

export type TransactionFilters = {
  from?: string;
  to?: string;
  accountId?: string;
  categoryId?: string;
  type?: TransactionType;
  nature?: Nature;
  search?: string;
};

export type TransactionCursor = {
  occurred_on: string;
  id: string;
};

export type TransactionPage = {
  items: TransactionWithRelations[];
  nextCursor: TransactionCursor | null;
};

const TRANSACTIONS_SELECT =
  '*, category:category_id(*), account:account_id(*), transfer_account:transfer_account_id(*)';

export async function listTransactions(
  filters: TransactionFilters = {},
  cursor?: TransactionCursor,
  pageSize = TRANSACTIONS_PAGE_SIZE,
): Promise<TransactionPage> {
  let query = supabase
    .from('transactions')
    .select(TRANSACTIONS_SELECT)
    .order('occurred_on', { ascending: false })
    .order('id', { ascending: false })
    .limit(pageSize);

  if (cursor) {
    query = query.or(
      `and(occurred_on.lt.${cursor.occurred_on}),and(occurred_on.eq.${cursor.occurred_on},id.lt.${cursor.id})`,
    );
  }

  if (filters.from) {
    query = query.gte('occurred_on', filters.from);
  }

  if (filters.to) {
    query = query.lte('occurred_on', filters.to);
  }

  if (filters.accountId) {
    query = query.eq('account_id', filters.accountId);
  }

  if (filters.categoryId) {
    query = query.eq('category_id', filters.categoryId);
  }

  if (filters.type) {
    query = query.eq('type', filters.type);
  }

  if (filters.nature) {
    query = query.eq('nature', filters.nature);
  }

  if (filters.search) {
    query = query.ilike('note', `%${filters.search}%`);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  const items = (data ?? []) as unknown as TransactionWithRelations[];
  const last = items[items.length - 1];

  return {
    items,
    nextCursor:
      items.length === pageSize && last ? { occurred_on: last.occurred_on, id: last.id } : null,
  };
}

export async function getTransaction(id: string): Promise<TransactionWithRelations | null> {
  const { data, error } = await supabase
    .from('transactions')
    .select(TRANSACTIONS_SELECT)
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as unknown as TransactionWithRelations | null) ?? null;
}

export async function getTransactionsInRange(
  from: string,
  to: string,
): Promise<TransactionWithRelations[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select(TRANSACTIONS_SELECT)
    .gte('occurred_on', from)
    .lte('occurred_on', to)
    .order('occurred_on', { ascending: false })
    .order('id', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as unknown as TransactionWithRelations[];
}

export async function createTransaction(input: TablesInsert<'transactions'>) {
  const { data, error } = await supabase.from('transactions').insert(input).select().single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateTransaction(id: string, input: TablesUpdate<'transactions'>) {
  const { data, error } = await supabase
    .from('transactions')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteTransaction(id: string) {
  const { error } = await supabase.from('transactions').delete().eq('id', id);

  if (error) {
    throw error;
  }
}
