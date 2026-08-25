import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiClient';

import type { Career } from './career.hook';

export function useSavedCareers() {
  return useQuery({
    queryKey: ['saved-careers'],
    queryFn: (): Promise<{ careers: (Career & { saved_at: string })[] }> => apiFetch('/saved-careers')
  });
}

export function useSaveCareer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (careerId: string): Promise<{ alreadySaved: boolean; career: Career }> =>
      apiFetch(`/saved-careers/${careerId}`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-careers'] });
    }
  });
}

export function useUnsaveCareer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (careerId: string) => apiFetch(`/saved-careers/${careerId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-careers'] });
    }
  });
}