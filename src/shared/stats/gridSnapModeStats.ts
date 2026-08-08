import type { SnapDifficulty } from '../../games/grid-snap/core/types';
import type { SnapMode } from '../../games/grid-snap/core/types';
import {
  deriveDailyFromModeStreaks,
  emptyDailyChallengeStats,
  mergeDailyChallengeStats,
  recordDailyChallengeResult,
  type DailyChallengeStats,
} from './dailyChallengeStats';
import type { TimeAggregates } from './timeAggregates';
import { emptyTimeAggregates, mergeTimeAggregates, recordElapsedTime } from './timeAggregates';

export type GridSnapStatsMode = SnapDifficulty;

export const GRID_SNAP_STATS_MODES: GridSnapStatsMode[] = ['easy', 'medium', 'hard'];

export interface GridSnapModeStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  time: TimeAggregates;
}

export type GridSnapStatsByMode = Record<GridSnapStatsMode, GridSnapModeStats>;

export interface GridSnapStoredStats {
  daily: DailyChallengeStats;
  byMode: GridSnapStatsByMode;
}

export function emptyGridSnapModeStats(): GridSnapModeStats {
  return {
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
    time: emptyTimeAggregates(),
  };
}

export function emptyGridSnapStatsByMode(): GridSnapStatsByMode {
  return {
    easy: emptyGridSnapModeStats(),
    medium: emptyGridSnapModeStats(),
    hard: emptyGridSnapModeStats(),
  };
}

export function emptyGridSnapStoredStats(): GridSnapStoredStats {
  return {
    daily: emptyDailyChallengeStats(),
    byMode: emptyGridSnapStatsByMode(),
  };
}

export function recordGridSnapModeResult(
  stats: GridSnapModeStats,
  won: boolean,
  elapsedSec: number,
): GridSnapModeStats {
  const gamesPlayed = stats.gamesPlayed + 1;
  const gamesWon = stats.gamesWon + (won ? 1 : 0);

  return {
    ...stats,
    gamesPlayed,
    gamesWon,
    time: won ? recordElapsedTime(stats.time, elapsedSec) : stats.time,
  };
}

export function recordGridSnapGameResult(
  stored: GridSnapStoredStats,
  difficulty: SnapDifficulty,
  mode: SnapMode,
  won: boolean,
  elapsedSec: number,
): GridSnapStoredStats {
  const byMode = {
    ...stored.byMode,
    [difficulty]: recordGridSnapModeResult(stored.byMode[difficulty], won, elapsedSec),
  };

  const daily =
    mode === 'daily'
      ? recordDailyChallengeResult(stored.daily, won)
      : stored.daily;

  return { daily, byMode };
}

export function mergeGridSnapModeStats(a: GridSnapModeStats, b: GridSnapModeStats): GridSnapModeStats {
  return {
    gamesPlayed: a.gamesPlayed + b.gamesPlayed,
    gamesWon: a.gamesWon + b.gamesWon,
    currentStreak: Math.max(a.currentStreak, b.currentStreak),
    maxStreak: Math.max(a.maxStreak, b.maxStreak),
    time: mergeTimeAggregates(a.time, b.time),
  };
}

export function mergeGridSnapStatsByMode(
  local: GridSnapStatsByMode,
  cloud: GridSnapStatsByMode,
): GridSnapStatsByMode {
  return {
    easy: mergeGridSnapModeStats(local.easy, cloud.easy),
    medium: mergeGridSnapModeStats(local.medium, cloud.medium),
    hard: mergeGridSnapModeStats(local.hard, cloud.hard),
  };
}

export function mergeGridSnapStoredStats(
  local: GridSnapStoredStats,
  cloud: GridSnapStoredStats,
): GridSnapStoredStats {
  return {
    daily: mergeDailyChallengeStats(local.daily, cloud.daily),
    byMode: mergeGridSnapStatsByMode(local.byMode, cloud.byMode),
  };
}

export function migrateLegacyGridSnapStats(stats: {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
}): GridSnapStoredStats {
  const byMode = {
    easy: { ...stats, time: emptyTimeAggregates() },
    medium: emptyGridSnapModeStats(),
    hard: emptyGridSnapModeStats(),
  };

  return {
    byMode,
    daily: deriveDailyFromModeStreaks(Object.values(byMode)),
  };
}

export function isLegacyGridSnapStats(value: unknown): value is {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
} {
  return (
    typeof value === 'object' &&
    value !== null &&
    'gamesPlayed' in value &&
    !('byMode' in value)
  );
}

function isGridSnapStatsByModeOnly(value: unknown): value is GridSnapStatsByMode {
  return (
    typeof value === 'object' &&
    value !== null &&
    'easy' in value &&
    'medium' in value &&
    'hard' in value &&
    !('daily' in value)
  );
}

export function normalizeGridSnapStoredStats(value: unknown): GridSnapStoredStats {
  if (value && typeof value === 'object' && 'byMode' in value) {
    const raw = value as GridSnapStoredStats;
    const byMode = raw.byMode;
    const empty = emptyGridSnapStatsByMode();
    const normalizedByMode = {
      easy: { ...empty.easy, ...byMode.easy, time: { ...empty.easy.time, ...byMode.easy?.time } },
      medium: { ...empty.medium, ...byMode.medium, time: { ...empty.medium.time, ...byMode.medium?.time } },
      hard: { ...empty.hard, ...byMode.hard, time: { ...empty.hard.time, ...byMode.hard?.time } },
    };

    const daily =
      raw.daily && typeof raw.daily === 'object'
        ? { ...emptyDailyChallengeStats(), ...raw.daily }
        : deriveDailyFromModeStreaks(Object.values(normalizedByMode));

    return { daily, byMode: normalizedByMode };
  }

  if (isGridSnapStatsByModeOnly(value)) {
    const byMode = value;
    const empty = emptyGridSnapStatsByMode();
    const normalizedByMode = {
      easy: { ...empty.easy, ...byMode.easy, time: { ...empty.easy.time, ...byMode.easy?.time } },
      medium: { ...empty.medium, ...byMode.medium, time: { ...empty.medium.time, ...byMode.medium?.time } },
      hard: { ...empty.hard, ...byMode.hard, time: { ...empty.hard.time, ...byMode.hard?.time } },
    };
    return {
      byMode: normalizedByMode,
      daily: deriveDailyFromModeStreaks(Object.values(normalizedByMode)),
    };
  }

  if (isLegacyGridSnapStats(value)) {
    return migrateLegacyGridSnapStats(value);
  }

  return emptyGridSnapStoredStats();
}
