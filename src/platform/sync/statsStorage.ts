import type { GridSnapStatsData } from '../../games/grid-snap/stores/gridSnapStatsStore';
import type { StatsData } from '../../games/word-hunt/stores/statsStore';
import { loadJson, removeKey, saveJson, storageKeys } from '../../shared/services/storage';
import { useAuthStore } from '../auth/authStore';
import { nowIso } from './mergePolicy';

export type StatsGameId = 'word-hunt' | 'grid-snap';

type CachedStats<T> = T & { updatedAt: string };

const LEGACY_KEYS: Record<StatsGameId, string> = {
  'word-hunt': storageKeys.stats,
  'grid-snap': storageKeys.gridSnapStats,
};

const emptyWordHuntStats = (): StatsData => ({
  gamesPlayed: 0,
  gamesWon: 0,
  currentStreak: 0,
  maxStreak: 0,
  distribution: [0, 0, 0, 0, 0, 0, 0],
});

const emptyGridSnapStats = (): GridSnapStatsData => ({
  gamesPlayed: 0,
  gamesWon: 0,
  currentStreak: 0,
  maxStreak: 0,
});

function guestKey(game: StatsGameId): string {
  return game === 'word-hunt' ? storageKeys.statsGuest : storageKeys.gridSnapStatsGuest;
}

function userKey(game: StatsGameId, userId: string): string {
  const prefix =
    game === 'word-hunt' ? storageKeys.statsUserPrefix : storageKeys.gridSnapStatsUserPrefix;
  return `${prefix}${userId}`;
}

async function migrateLegacyStatsKeys(): Promise<void> {
  await Promise.all(
    (Object.keys(LEGACY_KEYS) as StatsGameId[]).map(async (game) => {
      const legacyKey = LEGACY_KEYS[game];
      const legacyValue = await loadJson<StatsData | GridSnapStatsData>(legacyKey);
      if (legacyValue === null) {
        return;
      }

      const guestStorageKey = guestKey(game);
      const existingGuest = await loadJson(guestStorageKey);
      if (existingGuest === null) {
        await saveJson(guestStorageKey, legacyValue);
      }

      await removeKey(legacyKey);
    }),
  );
}

export function getActiveStatsUserId(): string | null {
  return useAuthStore.getState().user?.id ?? null;
}

function stripCachedStats<T extends StatsData | GridSnapStatsData>(
  value: (T & { updatedAt?: string }) | null,
): T | null {
  if (!value) {
    return null;
  }

  const { updatedAt: _ignored, ...stats } = value;
  return stats as T;
}

export async function loadWordHuntStats(): Promise<StatsData | null> {
  await migrateLegacyStatsKeys();

  const userId = getActiveStatsUserId();
  const key = userId ? userKey('word-hunt', userId) : guestKey('word-hunt');
  return stripCachedStats(await loadJson<StatsData & { updatedAt?: string }>(key));
}

export async function saveWordHuntStats(stats: StatsData): Promise<void> {
  await migrateLegacyStatsKeys();

  const userId = getActiveStatsUserId();
  const key = userId ? userKey('word-hunt', userId) : guestKey('word-hunt');
  await saveJson(key, stats);
}

export async function loadGuestWordHuntStats(): Promise<StatsData | null> {
  await migrateLegacyStatsKeys();
  return loadJson<StatsData>(guestKey('word-hunt'));
}

export async function saveUserWordHuntStats(
  userId: string,
  stats: StatsData,
  updatedAt = nowIso(),
): Promise<void> {
  await migrateLegacyStatsKeys();
  await saveJson(userKey('word-hunt', userId), { ...stats, updatedAt });
}

export async function loadUserWordHuntStats(
  userId: string,
): Promise<CachedStats<StatsData> | null> {
  await migrateLegacyStatsKeys();
  return loadJson<CachedStats<StatsData>>(userKey('word-hunt', userId));
}

export async function loadGridSnapStats(): Promise<GridSnapStatsData | null> {
  await migrateLegacyStatsKeys();

  const userId = getActiveStatsUserId();
  const key = userId ? userKey('grid-snap', userId) : guestKey('grid-snap');
  return stripCachedStats(await loadJson<GridSnapStatsData & { updatedAt?: string }>(key));
}

export async function saveGridSnapStats(stats: GridSnapStatsData): Promise<void> {
  await migrateLegacyStatsKeys();

  const userId = getActiveStatsUserId();
  const key = userId ? userKey('grid-snap', userId) : guestKey('grid-snap');
  await saveJson(key, stats);
}

export async function loadGuestGridSnapStats(): Promise<GridSnapStatsData | null> {
  await migrateLegacyStatsKeys();
  return loadJson<GridSnapStatsData>(guestKey('grid-snap'));
}

export async function saveUserGridSnapStats(
  userId: string,
  stats: GridSnapStatsData,
  updatedAt = nowIso(),
): Promise<void> {
  await migrateLegacyStatsKeys();
  await saveJson(userKey('grid-snap', userId), { ...stats, updatedAt });
}

export async function loadUserGridSnapStats(
  userId: string,
): Promise<CachedStats<GridSnapStatsData> | null> {
  await migrateLegacyStatsKeys();
  return loadJson<CachedStats<GridSnapStatsData>>(userKey('grid-snap', userId));
}

export async function resetGuestStats(): Promise<void> {
  await migrateLegacyStatsKeys();
  await Promise.all([
    saveJson(guestKey('word-hunt'), emptyWordHuntStats()),
    saveJson(guestKey('grid-snap'), emptyGridSnapStats()),
  ]);
}

export { emptyGridSnapStats, emptyWordHuntStats };
