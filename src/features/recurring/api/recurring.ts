import { supabase } from '@/lib/supabase';
import type { Tables, TablesInsert, TablesUpdate } from '@/types/database';
import { todayISO } from '@/lib/dates';

import { computeMissingOccurrences, maxOfDates, retroactiveStart } from '../utils/generation';

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

export async function generateDueTransactions(): Promise<number> {
  const { data: rules, error } = await supabase
    .from('recurring_rules')
    .select('*')
    .eq('is_active', true);

  if (error) {
    throw error;
  }

  const today = todayISO();
  const windowStart = retroactiveStart(today);
  let created = 0;

  for (const rule of rules ?? []) {
    const from = maxOfDates(rule.start_date, windowStart);

    if (from > today) {
      continue;
    }

    const { data: existing, error: existingError } = await supabase
      .from('transactions')
      .select('occurrence_date')
      .eq('recurring_rule_id', rule.id)
      .not('occurrence_date', 'is', null)
      .gte('occurrence_date', from)
      .lte('occurrence_date', today);

    if (existingError) {
      throw existingError;
    }

    const existingDates = (existing ?? [])
      .map((row) => row.occurrence_date)
      .filter((date): date is string => date !== null);

    const missing = computeMissingOccurrences(rule, existingDates, from, today);

    if (missing.length === 0) {
      continue;
    }

    const rows: TablesInsert<'transactions'>[] = missing.map((occurrenceDate) => ({
      type: rule.type,
      nature: rule.nature,
      amount: rule.amount,
      account_id: rule.account_id,
      transfer_account_id: null,
      category_id: rule.category_id,
      occurred_on: occurrenceDate,
      note: rule.note,
      recurring_rule_id: rule.id,
      occurrence_date: occurrenceDate,
    }));

    const { data: inserted, error: insertError } = await supabase
      .from('transactions')
      .upsert(rows, { onConflict: 'recurring_rule_id,occurrence_date', ignoreDuplicates: true })
      .select();

    if (insertError) {
      throw insertError;
    }

    created += inserted?.length ?? 0;
  }

  return created;
}
