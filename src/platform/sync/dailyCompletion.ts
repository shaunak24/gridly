import { useAuthStore } from '../auth/authStore';
import { loadString, removeKey, saveString, storageKeys } from '../../shared/services/storage';

export type DailyGameId = 'word-hunt' | 'grid-snap';

const LEGACY_KEYS: Record<DailyGameId, string> = {
  'word-hunt': storageKeys.dailyCompleted,
  'grid-snap': storageKeys.gridSnapDailyCompleted,
};

function guestKey(game: DailyGameId): string {
  return game === 'word-hunt' ? storageKeys.dailyCompletedGuest : storageKeys.gridSnapDailyCompletedGuest;
}

function userKey(game: DailyGameId, userId: string): string {
  const prefix =
    game === 'word-hunt' ? storageKeys.dailyCompletedUserPrefix : storageKeys.gridSnapDailyCompletedUserPrefix;
  return `${prefix}${userId}`;
}

async function migrateLegacyDailyKeys(): Promise<void> {
  await Promise.all(
    (Object.keys(LEGACY_KEYS) as DailyGameId[]).map(async (game) => {
      const legacyKey = LEGACY_KEYS[game];
      const legacyValue = await loadString(legacyKey);
      if (legacyValue === null) {
        return;
      }

      const guestStorageKey = guestKey(game);
      const existingGuest = await loadString(guestStorageKey);
      if (existingGuest === null) {
        await saveString(guestStorageKey, legacyValue);
      }

      await removeKey(legacyKey);
    }),
  );
}

export function getActiveDailyCompletionUserId(): string | null {
  return useAuthStore.getState().user?.id ?? null;
}

export async function loadDailyCompletedDate(game: DailyGameId): Promise<string | null> {
  await migrateLegacyDailyKeys();

  const userId = getActiveDailyCompletionUserId();
  const key = userId ? userKey(game, userId) : guestKey(game);
  return loadString(key);
}

export async function saveDailyCompletedDate(game: DailyGameId, date: string): Promise<void> {
  await migrateLegacyDailyKeys();

  const userId = getActiveDailyCompletionUserId();
  const key = userId ? userKey(game, userId) : guestKey(game);
  await saveString(key, date);
}

export async function loadGuestDailyCompletedDate(game: DailyGameId): Promise<string | null> {
  await migrateLegacyDailyKeys();
  return loadString(guestKey(game));
}
