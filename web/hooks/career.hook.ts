import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiClient';

import type { Mentor } from './mentor.hook';

// Matches the real `careers` table columns exactly.
export interface Career {
  id: string;
  cluster_id: number | null;
  title: string;
  why_this_summary: string | null;
  description: string | null;
  daily_tasks: string[] | null;
  key_skills: string[] | null;
  salary_local_min: number | null;
  salary_local_max: number | null;
  salary_local_currency: string;
  salary_intl_min: number | null;
  salary_intl_max: number | null;
  salary_intl_currency: string;
  created_at: string;
}

// GET /careers/:id joins in mentors via CareerService.getCareerWithMentors.
// NOTE: learning_resources are NOT included here yet -- that endpoint
// hasn't been built on the backend, so this field will be missing entirely
// until that's added, not just empty.
export interface CareerWithMentors extends Career {
  mentors: Mentor[];
}

export function useCareers(page = 1, pageSize = 20) {
  return useQuery({
    queryKey: ['careers', page, pageSize],
    queryFn: (): Promise<{ careers: Career[] }> =>
      apiFetch(`/careers?page=${page}&pageSize=${pageSize}`)
  });
}

export function useCareer(careerId: string | null) {
  return useQuery({
    queryKey: ['career', careerId],
    queryFn: (): Promise<{ career: CareerWithMentors }> => apiFetch(`/careers/${careerId}`),
    enabled: !!careerId
  });
}