/**
 * AI Matrx Mobile - Storage Utilities
 * Uses AsyncStorage for non-sensitive data (MMKV requires native build)
 * SecureStore for sensitive data
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

// Storage cache for synchronous-like access pattern
const cache: Map<string, string> = new Map();

/**
 * Initialize storage cache from AsyncStorage
 * Call this early in app lifecycle
 */
export async function initializeStorage(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const pairs = await AsyncStorage.multiGet(keys);
    pairs.forEach(([key, value]) => {
      if (value !== null) {
        cache.set(key, value);
      }
    });
  } catch (error) {
    console.error('Failed to initialize storage cache:', error);
  }
}

/**
 * Generic storage wrapper for non-sensitive data
 * Uses AsyncStorage with in-memory cache for sync-like access
 */
export const AppStorage = {
  // String operations (sync from cache, async update)
  getString: (key: string): string | undefined => {
    return cache.get(key);
  },
  setString: (key: string, value: string): void => {
    cache.set(key, value);
    AsyncStorage.setItem(key, value).catch(console.error);
  },

  // Number operations
  getNumber: (key: string): number | undefined => {
    const value = cache.get(key);
    return value ? parseFloat(value) : undefined;
  },
  setNumber: (key: string, value: number): void => {
    const strValue = value.toString();
    cache.set(key, strValue);
    AsyncStorage.setItem(key, strValue).catch(console.error);
  },

  // Boolean operations
  getBoolean: (key: string): boolean | undefined => {
    const value = cache.get(key);
    if (value === undefined) return undefined;
    return value === 'true';
  },
  setBoolean: (key: string, value: boolean): void => {
    const strValue = value.toString();
    cache.set(key, strValue);
    AsyncStorage.setItem(key, strValue).catch(console.error);
  },

  // JSON operations
  getJSON: <T>(key: string): T | null => {
    const value = cache.get(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  },
  setJSON: <T>(key: string, value: T): void => {
    const strValue = JSON.stringify(value);
    cache.set(key, strValue);
    AsyncStorage.setItem(key, strValue).catch(console.error);
  },

  // Delete operations
  delete: (key: string): void => {
    cache.delete(key);
    AsyncStorage.removeItem(key).catch(console.error);
  },
  clearAll: (): void => {
    cache.clear();
    AsyncStorage.clear().catch(console.error);
  },

  // Check if key exists
  contains: (key: string): boolean => {
    return cache.has(key);
  },

  // Get all keys
  getAllKeys: (): string[] => {
    return Array.from(cache.keys());
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
