import { supabase } from '@/lib/supabase';
import type { Enums, TablesInsert, TablesUpdate, Tables } from '@/types/database';

export type CategoryKind = Enums<'category_kind'>;
export type Category = Tables<'categories'>;

export async function listCategories(kind?: CategoryKind) {
  let query = supabase
    .from('categories')
    .select('*')
    .eq('is_archived', false)
    .order('sort_order', { ascending: true });

  if (kind) {
    query = query.eq('kind', kind);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data ?? []) as Category[];
}

export async function createCategory(input: TablesInsert<'categories'>) {
  const { data, error } = await supabase.from('categories').insert(input).select().single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateCategory(id: string, input: TablesUpdate<'categories'>) {
  const { data, error } = await supabase
    .from('categories')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function archiveCategory(id: string) {
  const { data, error } = await supabase
    .from('categories')
    .update({ is_archived: true })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function reorderCategories(items: { id: string; sort_order: number }[]) {
  for (const item of items) {
    const { error } = await supabase
      .from('categories')
      .update({ sort_order: item.sort_order })
      .eq('id', item.id);

    if (error) {
      throw error;
    }
  }
}
