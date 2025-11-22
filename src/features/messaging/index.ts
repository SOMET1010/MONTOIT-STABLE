/**
 * Feature: messaging
 * 
 * Exports publics de la feature messaging
 */

// Pages
export { default as MessagesPage } from './pages/MessagesPage';
export { default as NotificationPreferencesPage } from './pages/NotificationPreferencesPage';

// Components
export { default as ChatMessage } from './components/ChatMessage';
export { default as Chatbot } from './components/Chatbot';
export { default as MessageTemplates } from './components/MessageTemplates';
export { default as NotificationCenter } from './components/NotificationCenter';

// Hooks
export { 
  useConversations,
  useConversation,
  useMessages,
  useUnreadCount,
  useCreateConversation,
  useSendMessage,
  useMarkAsRead
} from './hooks/useMessages';
export { useMessageNotifications } from './hooks/useMessageNotifications';

// Services
export { messagingApi } from './services/messaging.api';

// Types
export type {
  Message,
  MessageInsert,
  Conversation,
  ConversationInsert,
  MessageWithSender,
  ConversationWithParticipants,
  SendMessageData,
  CreateConversationData,
  MessageNotification,
  ConversationFilters,
  MessageTemplate,
  MessageStatus,
  TypingIndicator,
  UnreadCount
} from './types';
