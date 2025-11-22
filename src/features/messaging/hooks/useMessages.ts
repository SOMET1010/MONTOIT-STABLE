import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { messagingApi } from '../services/messaging.api';
import type { Database } from '@/shared/lib/database.types';

type MessageInsert = Database['public']['Tables']['messages']['Insert'];
type ConversationInsert = Database['public']['Tables']['conversations']['Insert'];

export function useConversations(userId: string | undefined) {
  return useQuery({
    queryKey: ['conversations', userId],
    queryFn: () =>
      userId
        ? messagingApi.getConversationsByUserId(userId)
        : Promise.resolve({ data: [], error: null }),
    enabled: !!userId,
  });
}

export function useConversation(conversationId: string | undefined) {
  return useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: () =>
      conversationId
        ? messagingApi.getConversationById(conversationId)
        : Promise.resolve({ data: null, error: null }),
    enabled: !!conversationId,
  });
}

export function useMessages(conversationId: string | undefined) {
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () =>
      conversationId
        ? messagingApi.getMessagesByConversationId(conversationId)
        : Promise.resolve({ data: [], error: null }),
    enabled: !!conversationId,
    refetchInterval: 5000,
  });
}

export function useUnreadCount(userId: string | undefined) {
  return useQuery({
    queryKey: ['messages', 'unread', userId],
    queryFn: () =>
      userId ? messagingApi.getUnreadCount(userId) : Promise.resolve({ data: 0, error: null }),
    enabled: !!userId,
    refetchInterval: 10000,
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversation: ConversationInsert) => messagingApi.createConversation(conversation),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (message: MessageInsert) => messagingApi.sendMessage(message),
    onSuccess: (data) => {
      if (data.data) {
        queryClient.invalidateQueries({ queryKey: ['messages', data.data.conversation_id] });
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
      }
    },
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string, userId: string) => messagingApi.markConversationAsRead(conversationId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['messages', 'unread'] });
    },
  });
}

// Realtime messaging peut être ajouté plus tard avec Supabase Realtime
