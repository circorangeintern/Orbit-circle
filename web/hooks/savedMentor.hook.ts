import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiClient';

import type { Mentor } from './mentor.hook';

export function useSavedMentors() {
  return useQuery({
    queryKey: ['saved-mentors'],
    queryFn: (): Promise<{ mentors: (Mentor & { saved_at: string })[] }> => apiFetch('/saved-mentors')
  });
}

export function useSaveMentor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (mentorId: string): Promise<{ alreadySaved: boolean; mentor: Mentor }> =>
      apiFetch(`/saved-mentors/${mentorId}`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-mentors'] });
    }
  });
}

export function useUnsaveMentor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (mentorId: string) => apiFetch(`/saved-mentors/${mentorId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-mentors'] });
    }
  });
}