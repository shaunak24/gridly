import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  theme: '@gridly/theme',
  hardMode: '@gridly/hardMode',
  notifications: '@gridly/notifications',
  reminderHour: '@gridly/reminderHour',
  reminderMinute: '@gridly/reminderMinute',
  dailyCompleted: '@gridly/dailyCompleted',
  stats: '@gridly/stats',
  savedDaily: '@gridly/savedDaily',
  savedPractice: '@gridly/savedPractice',
} as const;

export async function loadString(key: string): Promise<string | null> {
  return AsyncStorage.getItem(key);
}

export async function saveString(key: string, value: string): Promise<void> {
  await AsyncStorage.setItem(key, value);
}

export async function loadJson<T>(key: string): Promise<T | null> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) {
    return null;
  }
  return JSON.parse(raw) as T;
}

export async function saveJson<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function removeKey(key: string): Promise<void> {
  await AsyncStorage.removeItem(key);
}

export const storageKeys = KEYS;
