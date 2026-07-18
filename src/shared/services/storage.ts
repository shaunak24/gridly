import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  theme: '@gridly/app/theme',
  guestContinued: '@gridly/app/guestContinued',
  hardMode: '@gridly/word-hunt/hardMode',
  notifications: '@gridly/word-hunt/notifications',
  reminderHour: '@gridly/word-hunt/reminderHour',
  reminderMinute: '@gridly/word-hunt/reminderMinute',
  dailyCompleted: '@gridly/word-hunt/dailyCompleted',
  stats: '@gridly/word-hunt/stats',
  savedDaily: '@gridly/word-hunt/savedDaily',
  savedPractice: '@gridly/word-hunt/savedPractice',
  gridSnapStats: '@gridly/grid-snap/stats',
  gridSnapDailyCompleted: '@gridly/grid-snap/dailyCompleted',
  gridSnapSavedDaily: '@gridly/grid-snap/savedDaily',
  gridSnapSavedPractice: '@gridly/grid-snap/savedPractice',
  gridSnapDifficulty: '@gridly/grid-snap/difficulty',
  gridSnapNotifications: '@gridly/grid-snap/notifications',
  gridSnapReminderHour: '@gridly/grid-snap/reminderHour',
  gridSnapReminderMinute: '@gridly/grid-snap/reminderMinute',
  storageMigrated: '@gridly/app/storageMigrated',
} as const;

const LEGACY_KEY_MAP: Record<string, string> = {
  '@gridly/theme': KEYS.theme,
  '@gridly/hardMode': KEYS.hardMode,
  '@gridly/notifications': KEYS.notifications,
  '@gridly/reminderHour': KEYS.reminderHour,
  '@gridly/reminderMinute': KEYS.reminderMinute,
  '@gridly/dailyCompleted': KEYS.dailyCompleted,
  '@gridly/stats': KEYS.stats,
  '@gridly/savedDaily': KEYS.savedDaily,
  '@gridly/savedPractice': KEYS.savedPractice,
};

let migrationPromise: Promise<void> | null = null;

export async function migrateStorageKeys(): Promise<void> {
  if (migrationPromise) {
    return migrationPromise;
  }

  migrationPromise = (async () => {
    const done = await AsyncStorage.getItem(KEYS.storageMigrated);
    if (done === 'true') {
      return;
    }

    await Promise.all(
      Object.entries(LEGACY_KEY_MAP).map(async ([legacyKey, nextKey]) => {
        const value = await AsyncStorage.getItem(legacyKey);
        if (value === null) {
          return;
        }
        const existing = await AsyncStorage.getItem(nextKey);
        if (existing === null) {
          await AsyncStorage.setItem(nextKey, value);
        }
        await AsyncStorage.removeItem(legacyKey);
      }),
    );

    await AsyncStorage.setItem(KEYS.storageMigrated, 'true');
  })();

  return migrationPromise;
}

export async function loadString(key: string): Promise<string | null> {
  await migrateStorageKeys();
  return AsyncStorage.getItem(key);
}

export async function saveString(key: string, value: string): Promise<void> {
  await migrateStorageKeys();
  await AsyncStorage.setItem(key, value);
}

export async function loadJson<T>(key: string): Promise<T | null> {
  await migrateStorageKeys();
  const raw = await AsyncStorage.getItem(key);
  if (!raw) {
    return null;
  }
  return JSON.parse(raw) as T;
}

export async function saveJson<T>(key: string, value: T): Promise<void> {
  await migrateStorageKeys();
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function removeKey(key: string): Promise<void> {
  await migrateStorageKeys();
  await AsyncStorage.removeItem(key);
}

export const storageKeys = KEYS;
