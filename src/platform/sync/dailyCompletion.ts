import { useAuthStore } from '../auth/authStore';
import { loadString, removeKey, saveString, storageKeys } from '../../shared/services/storage';

export type DailyGameId = 'word-hunt' | 'grid-snap' | 'color-flow';

const LEGACY_KEYS: Record<DailyGameId, string> = {
  'word-hunt': storageKeys.dailyCompleted,
  'grid-snap': storageKeys.gridSnapDailyCompleted,
  'color-flow': storageKeys.colorFlowDailyCompleted,
};

function guestKey(game: DailyGameId): string {
  if (game === 'word-hunt') {
    return storageKeys.dailyCompletedGuest;
  }
  if (game === 'grid-snap') {
    return storageKeys.gridSnapDailyCompletedGuest;
  }
  return storageKeys.colorFlowDailyCompletedGuest;
}

function userKey(game: DailyGameId, userId: string): string {
  if (game === 'word-hunt') {
    return `${storageKeys.dailyCompletedUserPrefix}${userId}`;
  }
  if (game === 'grid-snap') {
    return `${storageKeys.gridSnapDailyCompletedUserPrefix}${userId}`;
  }
  return `${storageKeys.colorFlowDailyCompletedUserPrefix}${userId}`;
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
