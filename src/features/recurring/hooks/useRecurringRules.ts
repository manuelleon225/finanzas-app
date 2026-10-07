import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { TablesInsert, TablesUpdate } from '@/types/database';

import {
  createRecurringRule as createRecurringRuleRequest,
  deleteRecurringRule as deleteRecurringRuleRequest,
  listRecurringRules,
  updateRecurringRule as updateRecurringRuleRequest,
} from '../api/recurring';

function invalidateRecurring(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: ['recurring-rules'] });
}

export function useRecurringRules() {
  return useQuery({
    queryKey: ['recurring-rules'],
    queryFn: () => listRecurringRules(),
  });
}

export function useCreateRecurringRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: TablesInsert<'recurring_rules'>) => createRecurringRuleRequest(input),
    onSuccess: () => invalidateRecurring(queryClient),
  });
}

export function useUpdateRecurringRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: TablesUpdate<'recurring_rules'> }) =>
      updateRecurringRuleRequest(id, input),
    onSuccess: () => invalidateRecurring(queryClient),
  });
}

export function useDeleteRecurringRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteRecurringRuleRequest(id),
    onSuccess: () => invalidateRecurring(queryClient),
  });
}
