/**
 * Tests unitaires pour messaging.api.ts
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { messagingApi } from '../messaging.api';
import { supabase } from '@/services/supabase/client';

// Mock Supabase
vi.mock('@/services/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('messagingApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getConversationsByUserId', () => {
    it('should fetch conversations for a user', async () => {
      const userId = 'user-123';
      const mockConversations = [
        { id: 'conv-1', participant1_id: userId, participant2_id: 'user-456' },
        { id: 'conv-2', participant1_id: 'user-789', participant2_id: userId },
      ];

      const mockSelect = vi.fn().mockReturnThis();
      const mockOr = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockResolvedValue({ data: mockConversations, error: null });

      (supabase.from as any).mockReturnValue({
        select: mockSelect,
        or: mockOr,
        order: mockOrder,
      });

      const result = await messagingApi.getConversationsByUserId(userId);

      expect(supabase.from).toHaveBeenCalledWith('conversations');
      expect(mockOr).toHaveBeenCalled();
      expect(mockOrder).toHaveBeenCalledWith('updated_at', { ascending: false });
      expect(result.data).toEqual(mockConversations);
    });
  });

  describe('getConversationById', () => {
    it('should fetch a conversation by ID', async () => {
      const conversationId = 'conv-123';
      const mockConversation = {
        id: conversationId,
        participant1_id: 'user-1',
        participant2_id: 'user-2',
      };

      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({ data: mockConversation, error: null });

      (supabase.from as any).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        single: mockSingle,
      });

      const result = await messagingApi.getConversationById(conversationId);

      expect(mockEq).toHaveBeenCalledWith('id', conversationId);
      expect(result.data).toEqual(mockConversation);
    });
  });

  describe('createConversation', () => {
    it('should return existing conversation if already exists', async () => {
      const conversationData = {
        participant1_id: 'user-1',
        participant2_id: 'user-2',
      };

      const existingConversation = { id: 'conv-existing', ...conversationData };

      const mockSelect = vi.fn().mockReturnThis();
      const mockOr = vi.fn().mockReturnThis();
      const mockMaybeSingle = vi.fn().mockResolvedValue({ data: existingConversation, error: null });

      (supabase.from as any).mockReturnValue({
        select: mockSelect,
        or: mockOr,
        maybeSingle: mockMaybeSingle,
      });

      const result = await messagingApi.createConversation(conversationData);

      expect(result.data).toEqual(existingConversation);
    });

    it('should create new conversation if none exists', async () => {
      const conversationData = {
        participant1_id: 'user-1',
        participant2_id: 'user-2',
      };

      const newConversation = { id: 'conv-new', ...conversationData };

      // Premier appel : vérification (aucune conversation trouvée)
      const mockSelect1 = vi.fn().mockReturnThis();
      const mockOr1 = vi.fn().mockReturnThis();
      const mockMaybeSingle1 = vi.fn().mockResolvedValue({ data: null, error: null });

      // Deuxième appel : création
      const mockInsert = vi.fn().mockReturnThis();
      const mockSelect2 = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({ data: newConversation, error: null });

      (supabase.from as any)
        .mockReturnValueOnce({
          select: mockSelect1,
          or: mockOr1,
          maybeSingle: mockMaybeSingle1,
        })
        .mockReturnValueOnce({
          insert: mockInsert,
          select: mockSelect2,
          single: mockSingle,
        });

      const result = await messagingApi.createConversation(conversationData);

      expect(mockInsert).toHaveBeenCalledWith(conversationData);
      expect(result.data).toEqual(newConversation);
    });
  });

  describe('sendMessage', () => {
    it('should send a message and update conversation', async () => {
      const messageData = {
        conversation_id: 'conv-123',
        sender_id: 'user-1',
        content: 'Hello!',
      };

      const sentMessage = { id: 'msg-1', ...messageData };

      const mockInsert = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({ data: sentMessage, error: null });

      const mockUpdate = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockResolvedValue({ error: null });

      (supabase.from as any)
        .mockReturnValueOnce({
          insert: mockInsert,
          select: mockSelect,
          single: mockSingle,
        })
        .mockReturnValueOnce({
          update: mockUpdate,
          eq: mockEq,
        });

      const result = await messagingApi.sendMessage(messageData);

      expect(mockInsert).toHaveBeenCalledWith(messageData);
      expect(mockUpdate).toHaveBeenCalled();
      expect(result.data).toEqual(sentMessage);
    });
  });

  describe('markAsRead', () => {
    it('should mark a message as read', async () => {
      const messageId = 'msg-123';
      const readMessage = { id: messageId, read: true };

      const mockUpdate = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({ data: readMessage, error: null });

      (supabase.from as any).mockReturnValue({
        update: mockUpdate,
        eq: mockEq,
        select: mockSelect,
        single: mockSingle,
      });

      const result = await messagingApi.markAsRead(messageId);

      expect(mockUpdate).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith('id', messageId);
      expect(result.data).toEqual(readMessage);
    });
  });

  describe('getUnreadCount', () => {
    it('should return 0 when user has no conversations', async () => {
      const userId = 'user-123';

      const mockSelect = vi.fn().mockReturnThis();
      const mockOr = vi.fn().mockResolvedValue({ data: [], error: null });

      (supabase.from as any).mockReturnValue({
        select: mockSelect,
        or: mockOr,
      });

      const result = await messagingApi.getUnreadCount(userId);

      expect(result.data).toBe(0);
    });

    it('should count unread messages across conversations', async () => {
      const userId = 'user-123';
      const conversations = [
        { id: 'conv-1' },
        { id: 'conv-2' },
      ];

      // Premier appel : récupérer les conversations
      const mockSelect1 = vi.fn().mockReturnThis();
      const mockOr1 = vi.fn().mockResolvedValue({ data: conversations, error: null });

      // Deuxième appel : compter les messages non lus
      const mockSelect2 = vi.fn().mockReturnThis();
      const mockIn = vi.fn().mockReturnThis();
      const mockNeq = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockResolvedValue({ count: 5, error: null });

      (supabase.from as any)
        .mockReturnValueOnce({
          select: mockSelect1,
          or: mockOr1,
        })
        .mockReturnValueOnce({
          select: mockSelect2,
          in: mockIn,
          neq: mockNeq,
          eq: mockEq,
        });

      const result = await messagingApi.getUnreadCount(userId);

      expect(mockIn).toHaveBeenCalledWith('conversation_id', ['conv-1', 'conv-2']);
      expect(mockNeq).toHaveBeenCalledWith('sender_id', userId);
      expect(mockEq).toHaveBeenCalledWith('read', false);
      expect(result.data).toBe(5);
    });
  });

  describe('deleteMessage', () => {
    it('should delete a message', async () => {
      const messageId = 'msg-123';

      const mockDelete = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockResolvedValue({ error: null });

      (supabase.from as any).mockReturnValue({
        delete: mockDelete,
        eq: mockEq,
      });

      const result = await messagingApi.deleteMessage(messageId);

      expect(mockDelete).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith('id', messageId);
      expect(result.error).toBeNull();
    });
  });

  describe('deleteConversation', () => {
    it('should delete conversation and its messages', async () => {
      const conversationId = 'conv-123';

      const mockDelete = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockResolvedValue({ error: null });

      (supabase.from as any).mockReturnValue({
        delete: mockDelete,
        eq: mockEq,
      });

      const result = await messagingApi.deleteConversation(conversationId);

      expect(supabase.from).toHaveBeenCalledWith('messages');
      expect(supabase.from).toHaveBeenCalledWith('conversations');
      expect(result.error).toBeNull();
    });
  });
});

