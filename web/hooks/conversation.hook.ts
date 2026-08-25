import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/apiClient";

export interface ConversationSummary {
  id: string;
  student_id: string;
  mentor_id: string;
  mentor_user_id: string | null;
  mentor_name: string;
  mentor_headline: string | null;
  mentor_photo_url: string | null;
  career_title: string | null;
  student_name: string;
  last_message_body: string | null;
  last_message_at: string | null;
  unreadCount: number;
  archived: boolean;
}

interface Message {
  id: number;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
}

export function useConversations() {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: (): Promise<{ conversations: ConversationSummary[] }> => apiFetch("/conversations"),
    refetchInterval: 15000 // light polling as a fallback alongside the socket
  });
}

export function useStartConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { mentorId: string; careerId?: string }): Promise<{ conversation: ConversationSummary }> =>
      apiFetch("/conversations", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    }
  });
}

export function useConversationMessages(conversationId: string | null) {
  return useQuery({
    queryKey: ["conversation-messages", conversationId],
    queryFn: (): Promise<{ messages: Message[] }> => apiFetch(`/conversations/${conversationId}/messages`),
    enabled: !!conversationId
  });
}

export function useMarkRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: string) => apiFetch(`/conversations/${conversationId}/read`, { method: "PATCH" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    }
  });
}

export function useSetArchived() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, archived }: { conversationId: string; archived: boolean }) =>
      apiFetch(`/conversations/${conversationId}/archive`, {
        method: "PATCH",
        body: JSON.stringify({ archived })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    }
  });
}