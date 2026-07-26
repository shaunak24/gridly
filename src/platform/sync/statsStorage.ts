import type { GridSnapStoredStats } from '../../shared/stats/gridSnapModeStats';
import {
  emptyGridSnapStatsByMode,
  normalizeGridSnapStoredStats,
} from '../../shared/stats/gridSnapModeStats';
import type { WordHuntStoredStats } from '../../shared/stats/wordHuntModeStats';
import {
  emptyWordHuntStatsByMode,
  normalizeWordHuntStoredStats,
} from '../../shared/stats/wordHuntModeStats';
import { loadJson, removeKey, saveJson, storageKeys } from '../../shared/services/storage';
import { useAuthStore } from '../auth/authStore';
import { nowIso } from './mergePolicy';

export type StatsGameId = 'word-hunt' | 'grid-snap';

type CachedStats<T> = T & { updatedAt: string };

const LEGACY_KEYS: Record<StatsGameId, string> = {
  'word-hunt': storageKeys.stats,
  'grid-snap': storageKeys.gridSnapStats,
};

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
      const legacyValue = await loadJson<unknown>(legacyKey);
      if (legacyValue === null) {
        return;
      }

      const guestStorageKey = guestKey(game);
      const existingGuest = await loadJson(guestStorageKey);
      if (existingGuest === null) {
        const normalized =
          game === 'word-hunt'
            ? normalizeWordHuntStoredStats(legacyValue)
            : normalizeGridSnapStoredStats(legacyValue);
        await saveJson(guestStorageKey, normalized);
      }

      await removeKey(legacyKey);
    }),
  );
}

export function getActiveStatsUserId(): string | null {
  return useAuthStore.getState().user?.id ?? null;
}

function stripCachedStats<T extends WordHuntStoredStats | GridSnapStoredStats>(
  value: (T & { updatedAt?: string }) | null,
): T | null {
  if (!value) {
    return null;
  }

  const { updatedAt: _ignored, ...stats } = value;
  return stats as T;
}

export async function loadWordHuntStats(): Promise<WordHuntStoredStats | null> {
  await migrateLegacyStatsKeys();

  const userId = getActiveStatsUserId();
  const key = userId ? userKey('word-hunt', userId) : guestKey('word-hunt');
  const raw = await loadJson<unknown & { updatedAt?: string }>(key);
  if (!raw) {
    return null;
  }

  return normalizeWordHuntStoredStats(stripCachedStats(raw));
}

export async function saveWordHuntStats(stats: WordHuntStoredStats): Promise<void> {
  await migrateLegacyStatsKeys();

  const userId = getActiveStatsUserId();
  const key = userId ? userKey('word-hunt', userId) : guestKey('word-hunt');
  await saveJson(key, stats);
}

export async function loadGuestWordHuntStats(): Promise<WordHuntStoredStats | null> {
  await migrateLegacyStatsKeys();
  const raw = await loadJson<unknown>(guestKey('word-hunt'));
  return raw ? normalizeWordHuntStoredStats(raw) : null;
}

export async function saveUserWordHuntStats(
  userId: string,
  stats: WordHuntStoredStats,
  updatedAt = nowIso(),
): Promise<void> {
  await migrateLegacyStatsKeys();
  await saveJson(userKey('word-hunt', userId), { ...stats, updatedAt });
}

export async function loadUserWordHuntStats(
  userId: string,
): Promise<CachedStats<WordHuntStoredStats> | null> {
  await migrateLegacyStatsKeys();
  const raw = await loadJson<CachedStats<unknown>>(userKey('word-hunt', userId));
  if (!raw) {
    return null;
  }

  const { updatedAt, ...rest } = raw;
  return { ...normalizeWordHuntStoredStats(rest), updatedAt: updatedAt ?? nowIso() };
}

export async function loadGridSnapStats(): Promise<GridSnapStoredStats | null> {
  await migrateLegacyStatsKeys();

  const userId = getActiveStatsUserId();
  const key = userId ? userKey('grid-snap', userId) : guestKey('grid-snap');
  const raw = await loadJson<unknown & { updatedAt?: string }>(key);
  if (!raw) {
    return null;
  }

  return normalizeGridSnapStoredStats(stripCachedStats(raw));
}

export async function saveGridSnapStats(stats: GridSnapStoredStats): Promise<void> {
  await migrateLegacyStatsKeys();

  const userId = getActiveStatsUserId();
  const key = userId ? userKey('grid-snap', userId) : guestKey('grid-snap');
  await saveJson(key, stats);
}

export async function loadGuestGridSnapStats(): Promise<GridSnapStoredStats | null> {
  await migrateLegacyStatsKeys();
  const raw = await loadJson<unknown>(guestKey('grid-snap'));
  return raw ? normalizeGridSnapStoredStats(raw) : null;
}

export async function saveUserGridSnapStats(
  userId: string,
  stats: GridSnapStoredStats,
  updatedAt = nowIso(),
): Promise<void> {
  await migrateLegacyStatsKeys();
  await saveJson(userKey('grid-snap', userId), { ...stats, updatedAt });
}

export async function loadUserGridSnapStats(
  userId: string,
): Promise<CachedStats<GridSnapStoredStats> | null> {
  await migrateLegacyStatsKeys();
  const raw = await loadJson<CachedStats<unknown>>(userKey('grid-snap', userId));
  if (!raw) {
    return null;
  }

  const { updatedAt, ...rest } = raw;
  return { ...normalizeGridSnapStoredStats(rest), updatedAt: updatedAt ?? nowIso() };
}

export async function resetGuestStats(): Promise<void> {
  await migrateLegacyStatsKeys();
  await Promise.all([
    saveJson(guestKey('word-hunt'), { byMode: emptyWordHuntStatsByMode() }),
    saveJson(guestKey('grid-snap'), { byMode: emptyGridSnapStatsByMode() }),
  ]);
}

export async function hasGuestStatsProgress(): Promise<boolean> {
  const [wordHunt, gridSnap] = await Promise.all([
    loadGuestWordHuntStats(),
    loadGuestGridSnapStats(),
  ]);

  const wordHuntPlayed = wordHunt
    ? Object.values(wordHunt.byMode).some((mode) => mode.gamesPlayed > 0)
    : false;
  const gridSnapPlayed = gridSnap
    ? Object.values(gridSnap.byMode).some((mode) => mode.gamesPlayed > 0)
    : false;

  return wordHuntPlayed || gridSnapPlayed;
}

export { emptyGridSnapStatsByMode as emptyGridSnapStats, emptyWordHuntStatsByMode as emptyWordHuntStats };
