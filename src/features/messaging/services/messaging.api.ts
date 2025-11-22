/**
 * Service API pour la messagerie
 * 
 * Ce service centralise tous les appels API liés aux messages et conversations.
 */

import { supabase } from '@/services/supabase/client';
import type { Database } from '@/shared/lib/database.types';

type Message = Database['public']['Tables']['messages']['Row'];
type MessageInsert = Database['public']['Tables']['messages']['Insert'];
type Conversation = Database['public']['Tables']['conversations']['Row'];
type ConversationInsert = Database['public']['Tables']['conversations']['Insert'];

/**
 * API de gestion de la messagerie
 */
export const messagingApi = {
  /**
   * Récupère toutes les conversations d'un utilisateur
   */
  getConversationsByUserId: async (userId: string) => {
    const { data, error } = await supabase
      .from('conversations')
      .select('*, participant1:profiles!participant1_id(*), participant2:profiles!participant2_id(*)')
      .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  },

  /**
   * Récupère une conversation par son ID
   */
  getConversationById: async (conversationId: string) => {
    const { data, error } = await supabase
      .from('conversations')
      .select('*, participant1:profiles!participant1_id(*), participant2:profiles!participant2_id(*)')
      .eq('id', conversationId)
      .single();

    if (error) throw error;
    return { data, error: null };
  },

  /**
   * Crée une nouvelle conversation
   */
  createConversation: async (conversation: ConversationInsert) => {
    // Vérifier si une conversation existe déjà entre ces deux utilisateurs
    const { data: existing } = await supabase
      .from('conversations')
      .select('*')
      .or(
        `and(participant1_id.eq.${conversation.participant1_id},participant2_id.eq.${conversation.participant2_id}),` +
        `and(participant1_id.eq.${conversation.participant2_id},participant2_id.eq.${conversation.participant1_id})`
      )
      .maybeSingle();

    if (existing) {
      return { data: existing, error: null };
    }

    const { data, error } = await supabase
      .from('conversations')
      .insert(conversation)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  },

  /**
   * Récupère tous les messages d'une conversation
   */
  getMessagesByConversationId: async (conversationId: string) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*, sender:profiles!sender_id(*)')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return { data, error: null };
  },

  /**
   * Envoie un message
   */
  sendMessage: async (message: MessageInsert) => {
    const { data, error } = await supabase
      .from('messages')
      .insert(message)
      .select()
      .single();

    if (error) throw error;

    // Mettre à jour la date de dernière mise à jour de la conversation
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', message.conversation_id);

    return { data, error: null };
  },

  /**
   * Marque un message comme lu
   */
  markAsRead: async (messageId: string) => {
    const { data, error } = await supabase
      .from('messages')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('id', messageId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  },

  /**
   * Marque tous les messages d'une conversation comme lus
   */
  markConversationAsRead: async (conversationId: string, userId: string) => {
    const { error } = await supabase
      .from('messages')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId)
      .eq('read', false);

    if (error) throw error;
    return { data: null, error: null };
  },

  /**
   * Récupère le nombre de messages non lus pour un utilisateur
   */
  getUnreadCount: async (userId: string) => {
    // Récupérer toutes les conversations de l'utilisateur
    const { data: conversations } = await supabase
      .from('conversations')
      .select('id')
      .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`);

    if (!conversations || conversations.length === 0) {
      return { data: 0, error: null };
    }

    const conversationIds = conversations.map(c => c.id);

    // Compter les messages non lus dans ces conversations
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .in('conversation_id', conversationIds)
      .neq('sender_id', userId)
      .eq('read', false);

    if (error) throw error;
    return { data: count || 0, error: null };
  },

  /**
   * Supprime un message
   */
  deleteMessage: async (messageId: string) => {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId);

    if (error) throw error;
    return { data: null, error: null };
  },

  /**
   * Supprime une conversation et tous ses messages
   */
  deleteConversation: async (conversationId: string) => {
    // Supprimer d'abord tous les messages
    await supabase
      .from('messages')
      .delete()
      .eq('conversation_id', conversationId);

    // Puis supprimer la conversation
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId);

    if (error) throw error;
    return { data: null, error: null };
  },
};

