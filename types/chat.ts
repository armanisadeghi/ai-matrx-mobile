/**
 * AI Matrx Mobile - Chat Types
 */

export interface Agent {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  capabilities: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  attachments?: Attachment[];
  metadata?: MessageMetadata;
  createdAt: string;
  isStreaming?: boolean;
}

export interface Attachment {
  id: string;
  type: 'image' | 'file' | 'audio' | 'video';
  url: string;
  name: string;
  size?: number;
  mimeType?: string;
  thumbnailUrl?: string;
}

export interface MessageMetadata {
  tokens?: number;
  model?: string;
  processingTime?: number;
}

export interface Conversation {
  id: string;
  agentId: string;
  userId: string;
  title: string;
  lastMessage?: Message;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
}

export interface SendMessageRequest {
  agentId: string;
  message: string;
  conversationId?: string;
  attachments?: File[];
}

export interface ChatStreamEvent {
  type: 'start' | 'token' | 'end' | 'error';
  content?: string;
  messageId?: string;
  conversationId?: string;
  error?: string;
}
