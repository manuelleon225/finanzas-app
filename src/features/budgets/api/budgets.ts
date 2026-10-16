import type { Category } from '@/features/categories/api/categories';
import { supabase } from '@/lib/supabase';
import type { Tables, TablesInsert, TablesUpdate } from '@/types/database';

export type Budget = Tables<'budgets'>;
export type BudgetWithCategory = Budget & { category: Category | null };

const BUDGETS_SELECT = '*, category:category_id(*)';

export async function listBudgets(): Promise<BudgetWithCategory[]> {
  const { data, error } = await supabase
    .from('budgets')
    .select(BUDGETS_SELECT)
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as unknown as BudgetWithCategory[];
}

export async function createBudget(input: TablesInsert<'budgets'>) {
  const { data, error } = await supabase.from('budgets').insert(input).select().single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateBudget(id: string, input: TablesUpdate<'budgets'>) {
  const { data, error } = await supabase
    .from('budgets')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteBudget(id: string) {
  const { error } = await supabase.from('budgets').delete().eq('id', id);

  if (error) {
    throw error;
  }
}
