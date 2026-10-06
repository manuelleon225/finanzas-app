import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { TablesInsert, TablesUpdate } from '@/types/database';

import {
  archiveCategory as archiveCategoryRequest,
  createCategory as createCategoryRequest,
  listCategories,
  restoreCategory as restoreCategoryRequest,
  reorderCategories as reorderCategoriesRequest,
  updateCategory as updateCategoryRequest,
  type CategoryKind,
} from '../api/categories';

type ListOptions = {
  archived?: boolean;
};

export function useCategories(kind?: CategoryKind, options?: ListOptions) {
  const archived = options?.archived ?? false;

  return useQuery({
    queryKey: ['categories', kind ?? 'all', archived ? 'archived' : 'active'],
    queryFn: () => listCategories(kind, { archived }),
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: TablesInsert<'categories'>) => createCategoryRequest(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: TablesUpdate<'categories'> }) =>
      updateCategoryRequest(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useArchiveCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => archiveCategoryRequest(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useRestoreCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => restoreCategoryRequest(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useReorderCategories() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (items: { id: string; sort_order: number }[]) => reorderCategoriesRequest(items),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}
