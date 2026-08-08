import type { FlowDifficulty } from '../../games/color-flow/core/types';
import type { FlowMode } from '../../games/color-flow/core/types';
import {
  deriveDailyFromModeStreaks,
  emptyDailyChallengeStats,
  mergeDailyChallengeStats,
  recordDailyChallengeResult,
  type DailyChallengeStats,
} from './dailyChallengeStats';
import type { TimeAggregates } from './timeAggregates';
import { emptyTimeAggregates, mergeTimeAggregates, recordElapsedTime } from './timeAggregates';

export type ColorFlowStatsMode = FlowDifficulty;

export const COLOR_FLOW_STATS_MODES: ColorFlowStatsMode[] = ['easy', 'medium', 'hard'];

export interface ColorFlowModeStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  time: TimeAggregates;
}

export type ColorFlowStatsByMode = Record<ColorFlowStatsMode, ColorFlowModeStats>;

export interface ColorFlowStoredStats {
  daily: DailyChallengeStats;
  byMode: ColorFlowStatsByMode;
}

export function emptyColorFlowModeStats(): ColorFlowModeStats {
  return {
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
    time: emptyTimeAggregates(),
  };
}

export function emptyColorFlowStatsByMode(): ColorFlowStatsByMode {
  return {
    easy: emptyColorFlowModeStats(),
    medium: emptyColorFlowModeStats(),
    hard: emptyColorFlowModeStats(),
  };
}

export function emptyColorFlowStoredStats(): ColorFlowStoredStats {
  return {
    daily: emptyDailyChallengeStats(),
    byMode: emptyColorFlowStatsByMode(),
  };
}

export function recordColorFlowModeResult(
  stats: ColorFlowModeStats,
  won: boolean,
  elapsedSec: number,
): ColorFlowModeStats {
  const gamesPlayed = stats.gamesPlayed + 1;
  const gamesWon = stats.gamesWon + (won ? 1 : 0);

  return {
    ...stats,
    gamesPlayed,
    gamesWon,
    time: won ? recordElapsedTime(stats.time, elapsedSec) : stats.time,
  };
}

export function recordColorFlowGameResult(
  stored: ColorFlowStoredStats,
  difficulty: FlowDifficulty,
  mode: FlowMode,
  won: boolean,
  elapsedSec: number,
): ColorFlowStoredStats {
  const byMode = {
    ...stored.byMode,
    [difficulty]: recordColorFlowModeResult(stored.byMode[difficulty], won, elapsedSec),
  };

  const daily =
    mode === 'daily'
      ? recordDailyChallengeResult(stored.daily, won)
      : stored.daily;

  return { daily, byMode };
}

export function mergeColorFlowModeStats(a: ColorFlowModeStats, b: ColorFlowModeStats): ColorFlowModeStats {
  return {
    gamesPlayed: a.gamesPlayed + b.gamesPlayed,
    gamesWon: a.gamesWon + b.gamesWon,
    currentStreak: Math.max(a.currentStreak, b.currentStreak),
    maxStreak: Math.max(a.maxStreak, b.maxStreak),
    time: mergeTimeAggregates(a.time, b.time),
  };
}

export function mergeColorFlowStatsByMode(
  local: ColorFlowStatsByMode,
  cloud: ColorFlowStatsByMode,
): ColorFlowStatsByMode {
  return {
    easy: mergeColorFlowModeStats(local.easy, cloud.easy),
    medium: mergeColorFlowModeStats(local.medium, cloud.medium),
    hard: mergeColorFlowModeStats(local.hard, cloud.hard),
  };
}

export function mergeColorFlowStoredStats(
  local: ColorFlowStoredStats,
  cloud: ColorFlowStoredStats,
): ColorFlowStoredStats {
  return {
    daily: mergeDailyChallengeStats(local.daily, cloud.daily),
    byMode: mergeColorFlowStatsByMode(local.byMode, cloud.byMode),
  };
}

function isColorFlowStatsByModeOnly(value: unknown): value is ColorFlowStatsByMode {
  return (
    typeof value === 'object' &&
    value !== null &&
    'easy' in value &&
    'medium' in value &&
    'hard' in value &&
    !('daily' in value)
  );
}

export function normalizeColorFlowStoredStats(value: unknown): ColorFlowStoredStats {
  if (value && typeof value === 'object' && 'byMode' in value) {
    const raw = value as ColorFlowStoredStats;
    const byMode = raw.byMode;
    const empty = emptyColorFlowStatsByMode();
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

  if (isColorFlowStatsByModeOnly(value)) {
    const byMode = value;
    const empty = emptyColorFlowStatsByMode();
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

  return emptyColorFlowStoredStats();
}
