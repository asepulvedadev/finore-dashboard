import { QueryClient } from '@tanstack/react-query';

/**
 * Configuración global de React Query
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache por 5 minutos
      staleTime: 5 * 60 * 1000,
      // Mantener cache por 10 minutos
      gcTime: 10 * 60 * 1000,
      // Reintentar una vez en caso de error
      retry: 1,
      // No refetch automático en focus/mount a menos que sea necesario
      refetchOnWindowFocus: false,
      refetchOnMount: true
    },
    mutations: {
      // Reintentar mutaciones fallidas una vez
      retry: 1
    }
  }
});