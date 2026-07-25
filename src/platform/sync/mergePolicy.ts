import type { GridSnapStatsData } from '../../games/grid-snap/stores/gridSnapStatsStore';
import type { StatsData } from '../../games/word-hunt/stores/statsStore';
import type {
  AppSettingsCloud,
  GridSnapSettingsCloud,
  GridSnapStatsCloud,
  Timestamped,
  WordHuntSettingsCloud,
  WordHuntStatsCloud,
} from './types';

export function nowIso(): string {
  return new Date().toISOString();
}

/** Guest device daily completion must not bleed into a signed-in account on merge. */
function mergeDailyCompletedDate(
  _local: string | null,
  cloud: string | null,
): string | null {
  if (cloud) {
    return cloud;
  }

  return null;
}

function pickLatest<T extends Timestamped>(local: T, cloud: T | null): T {
  if (!cloud) {
    return local;
  }
  return local.updatedAt >= cloud.updatedAt ? local : cloud;
}

export function mergeWordHuntStats(
  local: WordHuntStatsCloud,
  cloud: WordHuntStatsCloud | null,
): WordHuntStatsCloud {
  if (!cloud) {
    return {
      ...local,
      dailyCompletedDate: null,
      updatedAt: nowIso(),
    };
  }

  const distribution = local.distribution.map((value, index) => value + (cloud.distribution[index] ?? 0));

  return {
    gamesPlayed: local.gamesPlayed + cloud.gamesPlayed,
    gamesWon: local.gamesWon + cloud.gamesWon,
    currentStreak: Math.max(local.currentStreak, cloud.currentStreak),
    maxStreak: Math.max(local.maxStreak, cloud.maxStreak),
    distribution,
    dailyCompletedDate: mergeDailyCompletedDate(local.dailyCompletedDate, cloud.dailyCompletedDate),
    updatedAt: nowIso(),
  };
}

export function mergeGridSnapStats(
  local: GridSnapStatsCloud,
  cloud: GridSnapStatsCloud | null,
): GridSnapStatsCloud {
  if (!cloud) {
    return {
      ...local,
      dailyCompletedDate: null,
      updatedAt: nowIso(),
    };
  }

  return {
    gamesPlayed: local.gamesPlayed + cloud.gamesPlayed,
    gamesWon: local.gamesWon + cloud.gamesWon,
    currentStreak: Math.max(local.currentStreak, cloud.currentStreak),
    maxStreak: Math.max(local.maxStreak, cloud.maxStreak),
    dailyCompletedDate: mergeDailyCompletedDate(local.dailyCompletedDate, cloud.dailyCompletedDate),
    updatedAt: nowIso(),
  };
}

export function mergeWordHuntSettings(
  local: WordHuntSettingsCloud,
  cloud: WordHuntSettingsCloud | null,
): WordHuntSettingsCloud {
  return pickLatest(local, cloud);
}

export function mergeGridSnapSettings(
  local: GridSnapSettingsCloud,
  cloud: GridSnapSettingsCloud | null,
): GridSnapSettingsCloud {
  return pickLatest(local, cloud);
}

export function mergeAppSettings(
  local: AppSettingsCloud,
  cloud: AppSettingsCloud | null,
): AppSettingsCloud {
  return pickLatest(local, cloud);
}

export function toWordHuntStatsCloud(
  stats: StatsData,
  dailyCompletedDate: string | null,
  updatedAt = nowIso(),
): WordHuntStatsCloud {
  return { ...stats, dailyCompletedDate, updatedAt };
}

export function toGridSnapStatsCloud(
  stats: GridSnapStatsData,
  dailyCompletedDate: string | null,
  updatedAt = nowIso(),
): GridSnapStatsCloud {
  return { ...stats, dailyCompletedDate, updatedAt };
}
