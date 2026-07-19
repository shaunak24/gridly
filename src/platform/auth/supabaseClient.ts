import 'react-native-url-polyfill/auto';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

const SECURE_STORE_CHUNK_SIZE = 1800;

class SecureStoreAdapter {
  async getItem(key: string): Promise<string | null> {
    const chunkCountRaw = await SecureStore.getItemAsync(`${key}_count`);
    if (!chunkCountRaw) {
      return SecureStore.getItemAsync(key);
    }

    const chunkCount = Number(chunkCountRaw);
    if (!Number.isInteger(chunkCount) || chunkCount <= 0) {
      return null;
    }

    const chunks: string[] = [];
    for (let index = 0; index < chunkCount; index += 1) {
      const chunk = await SecureStore.getItemAsync(`${key}_${index}`);
      if (chunk === null) {
        return null;
      }
      chunks.push(chunk);
    }

    return chunks.join('');
  }

  async setItem(key: string, value: string): Promise<void> {
    if (value.length <= SECURE_STORE_CHUNK_SIZE) {
      await SecureStore.setItemAsync(key, value);
      await SecureStore.deleteItemAsync(`${key}_count`);
      return;
    }

    const chunkCount = Math.ceil(value.length / SECURE_STORE_CHUNK_SIZE);
    await SecureStore.setItemAsync(`${key}_count`, String(chunkCount));

    for (let index = 0; index < chunkCount; index += 1) {
      const start = index * SECURE_STORE_CHUNK_SIZE;
      const chunk = value.slice(start, start + SECURE_STORE_CHUNK_SIZE);
      await SecureStore.setItemAsync(`${key}_${index}`, chunk);
    }

    await SecureStore.deleteItemAsync(key);
  }

  async removeItem(key: string): Promise<void> {
    const chunkCountRaw = await SecureStore.getItemAsync(`${key}_count`);
    if (chunkCountRaw) {
      const chunkCount = Number(chunkCountRaw);
      if (Number.isInteger(chunkCount) && chunkCount > 0) {
        for (let index = 0; index < chunkCount; index += 1) {
          await SecureStore.deleteItemAsync(`${key}_${index}`);
        }
      }
      await SecureStore.deleteItemAsync(`${key}_count`);
    }

    await SecureStore.deleteItemAsync(key);
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
        storage: new SecureStoreAdapter(),
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        flowType: 'pkce',
      },
    });
  }

  return client;
}
