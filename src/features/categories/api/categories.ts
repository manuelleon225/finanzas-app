import { supabase } from '@/lib/supabase';
import type { Enums, TablesInsert, TablesUpdate, Tables } from '@/types/database';

export type CategoryKind = Enums<'category_kind'>;
export type Category = Tables<'categories'>;

export async function listCategories(kind?: CategoryKind, options: { archived?: boolean } = {}) {
  let query = supabase
    .from('categories')
    .select('*')
    .eq('is_archived', options.archived ?? false)
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
  const { data: children, error: childrenError } = await supabase
    .from('categories')
    .select('id')
    .eq('parent_id', id);

  if (childrenError) {
    throw childrenError;
  }

  const childrenIds = children?.map((child) => child.id) ?? [];
  const { data, error } = await supabase
    .from('categories')
    .update({ is_archived: true })
    .in('id', [id, ...childrenIds])
    .select();

  if (error) {
    throw error;
  }

  return data;
}

export async function restoreCategory(id: string) {
  const { data, error } = await supabase
    .from('categories')
    .update({ is_archived: false })
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
