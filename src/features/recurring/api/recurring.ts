import { supabase } from '@/lib/supabase';
import type { Tables, TablesInsert, TablesUpdate } from '@/types/database';

export type RecurringRule = Tables<'recurring_rules'>;
export type Category = Tables<'categories'>;
export type Account = Tables<'accounts'>;

export type RecurringRuleWithRelations = RecurringRule & {
  category: Category | null;
  account: Account | null;
};

const RECURRING_SELECT = '*, category:category_id(*), account:account_id(*)';

export async function listRecurringRules(): Promise<RecurringRuleWithRelations[]> {
  const { data, error } = await supabase
    .from('recurring_rules')
    .select(RECURRING_SELECT)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as unknown as RecurringRuleWithRelations[];
}

export async function createRecurringRule(input: TablesInsert<'recurring_rules'>) {
  const { data, error } = await supabase.from('recurring_rules').insert(input).select().single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateRecurringRule(id: string, input: TablesUpdate<'recurring_rules'>) {
  const { data, error } = await supabase
    .from('recurring_rules')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteRecurringRule(id: string) {
  const { error } = await supabase.from('recurring_rules').delete().eq('id', id);

  if (error) {
    throw error;
  }
}
