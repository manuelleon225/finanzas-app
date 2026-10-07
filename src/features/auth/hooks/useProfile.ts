import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';

import { useSession } from './AuthProvider';

export function useProfile() {
  const { user } = useSession();

  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', user!.id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data?.display_name ?? null;
    },
    enabled: !!user,
  });
}
