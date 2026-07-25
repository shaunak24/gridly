import type { TimeAggregates } from './timeAggregates';
import { emptyTimeAggregates, mergeTimeAggregates, recordElapsedTime } from './timeAggregates';

export type WordHuntMode = 'daily' | 'practice' | 'custom';

export const WORD_HUNT_MODES: WordHuntMode[] = ['daily', 'practice', 'custom'];

export interface WordHuntModeStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  distribution: number[];
  time: TimeAggregates;
}

export type WordHuntStatsByMode = Record<WordHuntMode, WordHuntModeStats>;

export interface WordHuntStoredStats {
  byMode: WordHuntStatsByMode;
}

export function emptyWordHuntModeStats(): WordHuntModeStats {
  return {
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
    distribution: [0, 0, 0, 0, 0, 0, 0],
    time: emptyTimeAggregates(),
  };
}

export function emptyWordHuntStatsByMode(): WordHuntStatsByMode {
  return {
    daily: emptyWordHuntModeStats(),
    practice: emptyWordHuntModeStats(),
    custom: emptyWordHuntModeStats(),
  };
}

export function recordWordHuntModeResult(
  stats: WordHuntModeStats,
  won: boolean,
  guessCount: number,
  elapsedSec: number,
): WordHuntModeStats {
  const gamesPlayed = stats.gamesPlayed + 1;
  const gamesWon = stats.gamesWon + (won ? 1 : 0);
  const currentStreak = won ? stats.currentStreak + 1 : 0;
  const maxStreak = Math.max(stats.maxStreak, currentStreak);
  const distribution = [...stats.distribution];

  if (won && guessCount >= 1 && guessCount <= 6) {
    distribution[guessCount - 1] += 1;
  } else if (!won) {
    distribution[6] += 1;
  }

  return {
    gamesPlayed,
    gamesWon,
    currentStreak,
    maxStreak,
    distribution,
    time: recordElapsedTime(stats.time, elapsedSec),
  };
}

export function mergeWordHuntModeStats(a: WordHuntModeStats, b: WordHuntModeStats): WordHuntModeStats {
  return {
    gamesPlayed: a.gamesPlayed + b.gamesPlayed,
    gamesWon: a.gamesWon + b.gamesWon,
    currentStreak: Math.max(a.currentStreak, b.currentStreak),
    maxStreak: Math.max(a.maxStreak, b.maxStreak),
    distribution: a.distribution.map((value, index) => value + (b.distribution[index] ?? 0)),
    time: mergeTimeAggregates(a.time, b.time),
  };
}

export function mergeWordHuntStatsByMode(
  local: WordHuntStatsByMode,
  cloud: WordHuntStatsByMode,
): WordHuntStatsByMode {
  return {
    daily: mergeWordHuntModeStats(local.daily, cloud.daily),
    practice: mergeWordHuntModeStats(local.practice, cloud.practice),
    custom: mergeWordHuntModeStats(local.custom, cloud.custom),
  };
}

/** Legacy flat stats map into the daily bucket. */
export function migrateLegacyWordHuntStats(stats: {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  distribution: number[];
}): WordHuntStoredStats {
  return {
    byMode: {
      daily: { ...stats, time: emptyTimeAggregates() },
      practice: emptyWordHuntModeStats(),
      custom: emptyWordHuntModeStats(),
    },
  };
}

export function isLegacyWordHuntStats(value: unknown): value is {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  distribution: number[];
} {
  return (
    typeof value === 'object' &&
    value !== null &&
    'gamesPlayed' in value &&
    !('byMode' in value)
  );
}

export function normalizeWordHuntStoredStats(value: unknown): WordHuntStoredStats {
  if (value && typeof value === 'object' && 'byMode' in value) {
    const byMode = (value as WordHuntStoredStats).byMode;
    const empty = emptyWordHuntStatsByMode();
    return {
      byMode: {
        daily: { ...empty.daily, ...byMode.daily, time: { ...empty.daily.time, ...byMode.daily?.time } },
        practice: { ...empty.practice, ...byMode.practice, time: { ...empty.practice.time, ...byMode.practice?.time } },
        custom: { ...empty.custom, ...byMode.custom, time: { ...empty.custom.time, ...byMode.custom?.time } },
      },
    };
  }

  if (isLegacyWordHuntStats(value)) {
    return migrateLegacyWordHuntStats(value);
  }

  return { byMode: emptyWordHuntStatsByMode() };
}
