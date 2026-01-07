/**
 * AI Matrx Mobile - Storage Utilities
 * High-performance storage using MMKV for non-sensitive data
 * SecureStore for sensitive data
 */

import { createMMKV, type MMKV } from 'react-native-mmkv';
import * as SecureStore from 'expo-secure-store';

// Initialize MMKV instance for fast local storage
// MMKV is 30x faster than AsyncStorage with synchronous API
export const storage: MMKV = createMMKV({
  id: 'ai-matrx-storage',
});

/**
 * Generic storage wrapper for non-sensitive data
 * Uses MMKV for high performance (30x faster than AsyncStorage)
 */
export const AppStorage = {
  // String operations
  getString: (key: string): string | undefined => {
    return storage.getString(key);
  },
  setString: (key: string, value: string): void => {
    storage.set(key, value);
  },

  // Number operations
  getNumber: (key: string): number | undefined => {
    return storage.getNumber(key);
  },
  setNumber: (key: string, value: number): void => {
    storage.set(key, value);
  },

  // Boolean operations
  getBoolean: (key: string): boolean | undefined => {
    return storage.getBoolean(key);
  },
  setBoolean: (key: string, value: boolean): void => {
    storage.set(key, value);
  },

  // JSON operations
  getJSON: <T>(key: string): T | null => {
    const value = storage.getString(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  },
  setJSON: <T>(key: string, value: T): void => {
    storage.set(key, JSON.stringify(value));
  },

  // Delete operations
  delete: (key: string): void => {
    storage.remove(key);
  },
  clearAll: (): void => {
    storage.clearAll();
  },

  // Check if key exists
  contains: (key: string): boolean => {
    return storage.contains(key);
  },

  // Get all keys
  getAllKeys: (): string[] => {
    return storage.getAllKeys();
  },
};

/**
 * Secure storage wrapper for sensitive data
 * Uses expo-secure-store with encryption
 */
export const SecureStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error('SecureStorage getItem error:', error);
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<boolean> => {
    try {
      await SecureStore.setItemAsync(key, value);
      return true;
    } catch (error) {
      console.error('SecureStorage setItem error:', error);
      return false;
    }
  },
  removeItem: async (key: string): Promise<boolean> => {
    try {
      await SecureStore.deleteItemAsync(key);
      return true;
    } catch (error) {
      console.error('SecureStorage removeItem error:', error);
      return false;
    }
  },
};

// Storage keys constants
export const StorageKeys = {
  // User preferences
  THEME: 'user_theme',
  ONBOARDING_COMPLETE: 'onboarding_complete',
  LAST_AGENT_ID: 'last_agent_id',
  
  // Chat
  DRAFT_MESSAGE: 'draft_message',
  CONVERSATIONS_CACHE: 'conversations_cache',
  
  // Settings
  HAPTICS_ENABLED: 'haptics_enabled',
  NOTIFICATIONS_ENABLED: 'notifications_enabled',
  
  // Device
  PUSH_TOKEN: 'push_token',
} as const;
