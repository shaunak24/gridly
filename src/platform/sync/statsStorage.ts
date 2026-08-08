import type { ColorFlowStoredStats } from '../../shared/stats/colorFlowModeStats';
import {
  emptyColorFlowStatsByMode,
  emptyColorFlowStoredStats,
  normalizeColorFlowStoredStats,
} from '../../shared/stats/colorFlowModeStats';
import {
  emptyGridSnapStatsByMode,
  emptyGridSnapStoredStats,
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

export type StatsGameId = 'word-hunt' | 'grid-snap' | 'color-flow';

type CachedStats<T> = T & { updatedAt: string };

const LEGACY_KEYS: Record<StatsGameId, string> = {
  'word-hunt': storageKeys.stats,
  'grid-snap': storageKeys.gridSnapStats,
  'color-flow': storageKeys.colorFlowStats,
};

function guestKey(game: StatsGameId): string {
  if (game === 'word-hunt') {
    return storageKeys.statsGuest;
  }
  if (game === 'grid-snap') {
    return storageKeys.gridSnapStatsGuest;
  }
  return storageKeys.colorFlowStatsGuest;
}

function userKey(game: StatsGameId, userId: string): string {
  if (game === 'word-hunt') {
    return `${storageKeys.statsUserPrefix}${userId}`;
  }
  if (game === 'grid-snap') {
    return `${storageKeys.gridSnapStatsUserPrefix}${userId}`;
  }
  return `${storageKeys.colorFlowStatsUserPrefix}${userId}`;
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
            : game === 'grid-snap'
              ? normalizeGridSnapStoredStats(legacyValue)
              : normalizeColorFlowStoredStats(legacyValue);
        await saveJson(guestStorageKey, normalized);
      }

      await removeKey(legacyKey);
    }),
  );
}

export function getActiveStatsUserId(): string | null {
  return useAuthStore.getState().user?.id ?? null;
}

function stripCachedStats<T extends WordHuntStoredStats | GridSnapStoredStats | ColorFlowStoredStats>(
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

export async function loadColorFlowStats(): Promise<ColorFlowStoredStats | null> {
  await migrateLegacyStatsKeys();

  const userId = getActiveStatsUserId();
  const key = userId ? userKey('color-flow', userId) : guestKey('color-flow');
  const raw = await loadJson<unknown & { updatedAt?: string }>(key);
  if (!raw) {
    return null;
  }

  return normalizeColorFlowStoredStats(stripCachedStats(raw));
}

export async function saveColorFlowStats(stats: ColorFlowStoredStats): Promise<void> {
  await migrateLegacyStatsKeys();

  const userId = getActiveStatsUserId();
  const key = userId ? userKey('color-flow', userId) : guestKey('color-flow');
  await saveJson(key, stats);
}

export async function loadGuestColorFlowStats(): Promise<ColorFlowStoredStats | null> {
  await migrateLegacyStatsKeys();
  const raw = await loadJson<unknown>(guestKey('color-flow'));
  return raw ? normalizeColorFlowStoredStats(raw) : null;
}

export async function saveUserColorFlowStats(
  userId: string,
  stats: ColorFlowStoredStats,
  updatedAt = nowIso(),
): Promise<void> {
  await migrateLegacyStatsKeys();
  await saveJson(userKey('color-flow', userId), { ...stats, updatedAt });
}

export async function loadUserColorFlowStats(
  userId: string,
): Promise<CachedStats<ColorFlowStoredStats> | null> {
  await migrateLegacyStatsKeys();
  const raw = await loadJson<CachedStats<unknown>>(userKey('color-flow', userId));
  if (!raw) {
    return null;
  }

  const { updatedAt, ...rest } = raw;
  return { ...normalizeColorFlowStoredStats(rest), updatedAt: updatedAt ?? nowIso() };
}

export async function resetGuestStats(): Promise<void> {
  await migrateLegacyStatsKeys();
  await Promise.all([
    saveJson(guestKey('word-hunt'), { byMode: emptyWordHuntStatsByMode() }),
    saveJson(guestKey('grid-snap'), emptyGridSnapStoredStats()),
    saveJson(guestKey('color-flow'), emptyColorFlowStoredStats()),
  ]);
}

export async function hasGuestStatsProgress(): Promise<boolean> {
  const [wordHunt, gridSnap, colorFlow] = await Promise.all([
    loadGuestWordHuntStats(),
    loadGuestGridSnapStats(),
    loadGuestColorFlowStats(),
  ]);

  const wordHuntPlayed = wordHunt
    ? Object.values(wordHunt.byMode).some((mode) => mode.gamesPlayed > 0)
    : false;
  const gridSnapPlayed = gridSnap
    ? Object.values(gridSnap.byMode).some((mode) => mode.gamesPlayed > 0)
    : false;
  const colorFlowPlayed = colorFlow
    ? Object.values(colorFlow.byMode).some((mode) => mode.gamesPlayed > 0)
    : false;

  return wordHuntPlayed || gridSnapPlayed || colorFlowPlayed;
}

export {
  emptyColorFlowStoredStats as emptyColorFlowStats,
  emptyGridSnapStoredStats as emptyGridSnapStats,
  emptyWordHuntStatsByMode as emptyWordHuntStats,
};
