import type { FlowDifficulty } from '../../games/color-flow/core/types';
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

export function recordColorFlowModeResult(
  stats: ColorFlowModeStats,
  won: boolean,
  elapsedSec: number,
): ColorFlowModeStats {
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

export function normalizeColorFlowStoredStats(value: unknown): ColorFlowStoredStats {
  if (value && typeof value === 'object' && 'byMode' in value) {
    const byMode = (value as ColorFlowStoredStats).byMode;
    const empty = emptyColorFlowStatsByMode();
    return {
      byMode: {
        easy: { ...empty.easy, ...byMode.easy, time: { ...empty.easy.time, ...byMode.easy?.time } },
        medium: { ...empty.medium, ...byMode.medium, time: { ...empty.medium.time, ...byMode.medium?.time } },
        hard: { ...empty.hard, ...byMode.hard, time: { ...empty.hard.time, ...byMode.hard?.time } },
      },
    };
  }

  return { byMode: emptyColorFlowStatsByMode() };
}
