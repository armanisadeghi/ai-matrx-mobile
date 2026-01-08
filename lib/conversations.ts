/**
 * AI Matrx Mobile - Conversation Management
 * Local storage and retrieval of conversations using MMKV
 */

import { Message } from '@/types/chat';
import { storage } from './storage';

const CONVERSATIONS_KEY = 'conversations';
const MESSAGES_PREFIX = 'messages_';
const RECENT_CONVERSATIONS_KEY = 'recent_conversations';

export interface Conversation {
  id: string;
  agentId: string;
  title: string;
  lastMessage: string;
  timestamp: number;
  createdAt: number;
}

/**
 * Create a new conversation
 */
export function createConversation(agentId: string, title?: string): Conversation {
  const conversation: Conversation = {
    id: Date.now().toString(),
    agentId,
    title: title || 'New Chat',
    lastMessage: '',
    timestamp: Date.now(),
    createdAt: Date.now(),
  };

  // Save conversation
  const conversations = getAllConversations();
  conversations.unshift(conversation);
  storage.set(CONVERSATIONS_KEY, JSON.stringify(conversations));

  return conversation;
}

/**
 * Get conversation by ID
 */
export function getConversation(id: string): Conversation | null {
  const conversations = getAllConversations();
  return conversations.find((c) => c.id === id) || null;
}

/**
 * Get all conversations
 */
export function getAllConversations(): Conversation[] {
  try {
    const data = storage.getString(CONVERSATIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting conversations:', error);
    return [];
  }
}

/**
 * Get recent conversations (sorted by timestamp)
 */
export function getRecentConversations(limit: number = 20): Conversation[] {
  const conversations = getAllConversations();
  return conversations
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);
}

/**
 * Update conversation
 */
export function updateConversation(id: string, updates: Partial<Conversation>): void {
  const conversations = getAllConversations();
  const index = conversations.findIndex((c) => c.id === id);
  
  if (index !== -1) {
    conversations[index] = { ...conversations[index], ...updates };
    storage.set(CONVERSATIONS_KEY, JSON.stringify(conversations));
  }
}

/**
 * Delete conversation
 */
export function deleteConversation(id: string): void {
  // Delete messages
  storage.remove(`${MESSAGES_PREFIX}${id}`);
  
  // Delete conversation
  const conversations = getAllConversations();
  const filtered = conversations.filter((c) => c.id !== id);
  storage.set(CONVERSATIONS_KEY, JSON.stringify(filtered));
}

/**
 * Save message to conversation
 */
export function saveMessage(conversationId: string, message: Message): void {
  const messages = getMessages(conversationId);
  messages.push(message);
  storage.set(`${MESSAGES_PREFIX}${conversationId}`, JSON.stringify(messages));

  // Update conversation last message and timestamp
  updateConversation(conversationId, {
    lastMessage: message.content.substring(0, 100),
    timestamp: Date.now(),
  });
}

/**
 * Get messages for conversation
 */
export function getMessages(conversationId: string): Message[] {
  try {
    const data = storage.getString(`${MESSAGES_PREFIX}${conversationId}`);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting messages:', error);
    return [];
  }
}

/**
 * Clear all messages for conversation
 */
export function clearMessages(conversationId: string): void {
  storage.remove(`${MESSAGES_PREFIX}${conversationId}`);
}

/**
 * Search conversations by title or content
 */
export function searchConversations(query: string): Conversation[] {
  const conversations = getAllConversations();
  const lowerQuery = query.toLowerCase();
  
  return conversations.filter(
    (c) =>
      c.title.toLowerCase().includes(lowerQuery) ||
      c.lastMessage.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get conversation title from first message or generate one
 */
export function generateConversationTitle(messages: Message[]): string {
  if (messages.length === 0) return 'New Chat';
  
  const firstUserMessage = messages.find((m) => m.role === 'user');
  if (!firstUserMessage) return 'New Chat';
  
  // Get first 50 characters of first message
  const title = firstUserMessage.content.substring(0, 50);
  return title + (firstUserMessage.content.length > 50 ? '...' : '');
}
