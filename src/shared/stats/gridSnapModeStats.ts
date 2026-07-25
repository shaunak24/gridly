import type { SnapDifficulty } from '../../games/grid-snap/core/types';
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

export function recordGridSnapModeResult(
  stats: GridSnapModeStats,
  won: boolean,
  elapsedSec: number,
): GridSnapModeStats {
  const gamesPlayed = stats.gamesPlayed + 1;
  const gamesWon = stats.gamesWon + (won ? 1 : 0);
  const currentStreak = won ? stats.currentStreak + 1 : 0;
  const maxStreak = Math.max(stats.maxStreak, currentStreak);

  return {
    gamesPlayed,
    gamesWon,
    currentStreak,
    maxStreak,
    time: recordElapsedTime(stats.time, elapsedSec),
  };
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

export function migrateLegacyGridSnapStats(stats: {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
}): GridSnapStoredStats {
  return {
    byMode: {
      easy: { ...stats, time: emptyTimeAggregates() },
      medium: emptyGridSnapModeStats(),
      hard: emptyGridSnapModeStats(),
    },
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

export function normalizeGridSnapStoredStats(value: unknown): GridSnapStoredStats {
  if (value && typeof value === 'object' && 'byMode' in value) {
    const byMode = (value as GridSnapStoredStats).byMode;
    const empty = emptyGridSnapStatsByMode();
    return {
      byMode: {
        easy: { ...empty.easy, ...byMode.easy, time: { ...empty.easy.time, ...byMode.easy?.time } },
        medium: { ...empty.medium, ...byMode.medium, time: { ...empty.medium.time, ...byMode.medium?.time } },
        hard: { ...empty.hard, ...byMode.hard, time: { ...empty.hard.time, ...byMode.hard?.time } },
      },
    };
  }

  if (isLegacyGridSnapStats(value)) {
    return migrateLegacyGridSnapStats(value);
  }

  return { byMode: emptyGridSnapStatsByMode() };
}
