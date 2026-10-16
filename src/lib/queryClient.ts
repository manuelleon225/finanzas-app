import { QueryClient } from '@tanstack/react-query';

export const SEVEN_DAYS_MS = 1000 * 60 * 60 * 24 * 7;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      // Igual o mayor que el maxAge de la persistencia (7 días).
      gcTime: SEVEN_DAYS_MS,
    },
  },
});
