import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiClient';

// Matches the real `mentors` table columns exactly.
export interface Mentor {
  id: string;
  full_name: string;
  headline: string | null;
  location: string | null;
  years_experience: number | null;
  specialty_tags: string[] | null;
  bio: string | null;
  photo_url: string | null; // currently NULL for every seeded mentor -- frontend needs a fallback avatar
  rating_avg: number;
  rating_count: number;
  is_active: boolean;
  created_at: string;
}

export function useMentors(page = 1, pageSize = 20) {
  return useQuery({
    queryKey: ['mentors', page, pageSize],
    queryFn: (): Promise<{ mentors: Mentor[] }> =>
      apiFetch(`/mentors?page=${page}&pageSize=${pageSize}`)
  });
}

export function useMentor(mentorId: string | null) {
  return useQuery({
    queryKey: ['mentor', mentorId],
    queryFn: (): Promise<{ mentor: Mentor }> => apiFetch(`/mentors/${mentorId}`),
    enabled: !!mentorId
  });
}