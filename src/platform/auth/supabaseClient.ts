import 'react-native-url-polyfill/auto';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

const SECURE_STORE_CHUNK_SIZE = 1800;

function isWebStorage(): boolean {
  return Platform.OS === 'web';
}

async function storageGetItem(key: string): Promise<string | null> {
  if (isWebStorage()) {
    return globalThis.localStorage?.getItem(key) ?? null;
  }

  return SecureStore.getItemAsync(key);
}

async function storageSetItem(key: string, value: string): Promise<void> {
  if (isWebStorage()) {
    globalThis.localStorage?.setItem(key, value);
    return;
  }

  await SecureStore.setItemAsync(key, value);
}

async function storageRemoveItem(key: string): Promise<void> {
  if (isWebStorage()) {
    globalThis.localStorage?.removeItem(key);
    return;
  }

  await SecureStore.deleteItemAsync(key);
}

class AuthStorageAdapter {
  async getItem(key: string): Promise<string | null> {
    const chunkCountRaw = await storageGetItem(`${key}_count`);
    if (!chunkCountRaw) {
      return storageGetItem(key);
    }

    const chunkCount = Number(chunkCountRaw);
    if (!Number.isInteger(chunkCount) || chunkCount <= 0) {
      return null;
    }

    const chunks: string[] = [];
    for (let index = 0; index < chunkCount; index += 1) {
      const chunk = await storageGetItem(`${key}_${index}`);
      if (chunk === null) {
        return null;
      }
      chunks.push(chunk);
    }

    return chunks.join('');
  }

  async setItem(key: string, value: string): Promise<void> {
    if (value.length <= SECURE_STORE_CHUNK_SIZE) {
      await storageSetItem(key, value);
      await storageRemoveItem(`${key}_count`);
      return;
    }

    const chunkCount = Math.ceil(value.length / SECURE_STORE_CHUNK_SIZE);
    await storageSetItem(`${key}_count`, String(chunkCount));

    for (let index = 0; index < chunkCount; index += 1) {
      const start = index * SECURE_STORE_CHUNK_SIZE;
      const chunk = value.slice(start, start + SECURE_STORE_CHUNK_SIZE);
      await storageSetItem(`${key}_${index}`, chunk);
    }

    await storageRemoveItem(key);
  }

  async removeItem(key: string): Promise<void> {
    const chunkCountRaw = await storageGetItem(`${key}_count`);
    if (chunkCountRaw) {
      const chunkCount = Number(chunkCountRaw);
      if (Number.isInteger(chunkCount) && chunkCount > 0) {
        for (let index = 0; index < chunkCount; index += 1) {
          await storageRemoveItem(`${key}_${index}`);
        }
      }
      await storageRemoveItem(`${key}_count`);
    }

    await storageRemoveItem(key);
  }
}

let client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) {
    return null;
  }

  if (!client) {
    client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: new AuthStorageAdapter(),
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        flowType: 'pkce',
      },
    });
  }

  return client;
}
