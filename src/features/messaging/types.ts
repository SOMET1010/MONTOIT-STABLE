/**
 * Types TypeScript pour la feature messaging
 */

import type { Database } from '@/shared/lib/database.types';

// Types de base depuis la base de données
export type Message = Database['public']['Tables']['messages']['Row'];
export type MessageInsert = Database['public']['Tables']['messages']['Insert'];
export type Conversation = Database['public']['Tables']['conversations']['Row'];
export type ConversationInsert = Database['public']['Tables']['conversations']['Insert'];

// Types étendus pour l'application
export interface MessageWithSender extends Message {
  sender: {
    id: string;
    full_name: string;
    avatar_url?: string;
    role: string;
  };
}

export interface ConversationWithParticipants extends Conversation {
  participant1: {
    id: string;
    full_name: string;
    avatar_url?: string;
    role: string;
  };
  participant2: {
    id: string;
    full_name: string;
    avatar_url?: string;
    role: string;
  };
  last_message?: MessageWithSender;
  unread_count?: number;
}

export interface SendMessageData {
  conversation_id: string;
  content: string;
  attachments?: string[];
}

export interface CreateConversationData {
  participant1_id: string;
  participant2_id: string;
  property_id?: string;
  lease_id?: string;
}

export interface MessageNotification {
  id: string;
  conversation_id: string;
  message_id: string;
  sender_name: string;
  content: string;
  created_at: string;
  read: boolean;
}

export interface ConversationFilters {
  user_id: string;
  property_id?: string;
  lease_id?: string;
  unread_only?: boolean;
}

export interface MessageTemplate {
  id: string;
  title: string;
  content: string;
  category: 'greeting' | 'inquiry' | 'appointment' | 'follow_up' | 'other';
  variables?: string[];
}

export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface TypingIndicator {
  conversation_id: string;
  user_id: string;
  is_typing: boolean;
  timestamp: string;
}

export interface UnreadCount {
  total: number;
  by_conversation: Record<string, number>;
}

