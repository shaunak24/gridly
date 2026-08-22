import type { FlowDifficulty } from '../../games/color-flow/core/types';
import type { FlowMode } from '../../games/color-flow/core/types';
import { SEASON_1_ID } from '../../games/color-flow/core/seasons';
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

export interface ColorFlowCampaignSeasonProgress {
  highestUnlocked: number;
  completedLevels: number[];
}

export interface ColorFlowCampaignProgress {
  activeSeasonId: string;
  seasons: Record<string, ColorFlowCampaignSeasonProgress>;
}

export interface ColorFlowCampaignSeasonStats {
  highestUnlocked: number;
  completedCount: number;
}

export interface ColorFlowCampaignStats {
  activeSeasonId: string;
  seasons: Record<string, ColorFlowCampaignSeasonStats>;
}

export interface ColorFlowStoredStats {
  daily: DailyChallengeStats;
  byMode: ColorFlowStatsByMode;
  campaign?: ColorFlowCampaignProgress;
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
    campaign: emptyColorFlowCampaignProgress(),
  };
}

export function emptyColorFlowCampaignSeasonProgress(): ColorFlowCampaignSeasonProgress {
  return { highestUnlocked: 1, completedLevels: [] };
}

export function emptyColorFlowCampaignProgress(): ColorFlowCampaignProgress {
  return {
    activeSeasonId: SEASON_1_ID,
    seasons: {
      [SEASON_1_ID]: emptyColorFlowCampaignSeasonProgress(),
    },
  };
}

export function campaignStatsFromProgress(progress: ColorFlowCampaignProgress): ColorFlowCampaignStats {
  const seasons: Record<string, ColorFlowCampaignSeasonStats> = {};
  for (const [seasonId, season] of Object.entries(progress.seasons)) {
    seasons[seasonId] = {
      highestUnlocked: season.highestUnlocked,
      completedCount: season.completedLevels.length,
    };
  }
  return { activeSeasonId: progress.activeSeasonId, seasons };
}

export function completeCampaignLevel(
  progress: ColorFlowCampaignProgress,
  seasonId: string,
  level: number,
  levelCount: number,
): ColorFlowCampaignProgress {
  const seasons = { ...progress.seasons };
  const current = seasons[seasonId] ?? emptyColorFlowCampaignSeasonProgress();
  const completedSet = new Set(current.completedLevels);
  completedSet.add(level);
  const completedLevels = [...completedSet].sort((a, b) => a - b);
  const highestUnlocked = Math.max(current.highestUnlocked, Math.min(level + 1, levelCount));

  seasons[seasonId] = { highestUnlocked, completedLevels };
  return { activeSeasonId: progress.activeSeasonId, seasons };
}

export function isCampaignLevelPlayable(
  progress: ColorFlowCampaignProgress,
  seasonId: string,
  level: number,
): boolean {
  const season = progress.seasons[seasonId];
  if (!season) {
    return level === 1;
  }
  return level <= season.highestUnlocked;
}

export function isCampaignLevelCompleted(
  progress: ColorFlowCampaignProgress,
  seasonId: string,
  level: number,
): boolean {
  const season = progress.seasons[seasonId];
  return season?.completedLevels.includes(level) ?? false;
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
  if (mode === 'campaign') {
    return stored;
  }

  const byMode = {
    ...stored.byMode,
    [difficulty]: recordColorFlowModeResult(stored.byMode[difficulty], won, elapsedSec),
  };

  const daily =
    mode === 'daily'
      ? recordDailyChallengeResult(stored.daily, won)
      : stored.daily;

  return { daily, byMode, campaign: stored.campaign };
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

export function mergeColorFlowCampaignSeasonProgress(
  a: ColorFlowCampaignSeasonProgress,
  b: ColorFlowCampaignSeasonProgress,
): ColorFlowCampaignSeasonProgress {
  const completedSet = new Set([...a.completedLevels, ...b.completedLevels]);
  return {
    highestUnlocked: Math.max(a.highestUnlocked, b.highestUnlocked),
    completedLevels: [...completedSet].sort((left, right) => left - right),
  };
}

export function mergeColorFlowCampaignProgress(
  local: ColorFlowCampaignProgress,
  cloud: ColorFlowCampaignProgress,
): ColorFlowCampaignProgress {
  const seasonIds = new Set([...Object.keys(local.seasons), ...Object.keys(cloud.seasons)]);
  const seasons: Record<string, ColorFlowCampaignSeasonProgress> = {};
  for (const seasonId of seasonIds) {
    const left = local.seasons[seasonId] ?? emptyColorFlowCampaignSeasonProgress();
    const right = cloud.seasons[seasonId] ?? emptyColorFlowCampaignSeasonProgress();
    seasons[seasonId] = mergeColorFlowCampaignSeasonProgress(left, right);
  }
  return {
    activeSeasonId: local.activeSeasonId || cloud.activeSeasonId,
    seasons,
  };
}

export function mergeColorFlowStoredStats(
  local: ColorFlowStoredStats,
  cloud: ColorFlowStoredStats,
): ColorFlowStoredStats {
  const campaign =
    local.campaign && cloud.campaign
      ? mergeColorFlowCampaignProgress(local.campaign, cloud.campaign)
      : local.campaign ?? cloud.campaign ?? emptyColorFlowCampaignProgress();

  return {
    daily: mergeDailyChallengeStats(local.daily, cloud.daily),
    byMode: mergeColorFlowStatsByMode(local.byMode, cloud.byMode),
    campaign,
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

    const campaign =
      raw.campaign && typeof raw.campaign === 'object'
        ? normalizeColorFlowCampaignProgress(raw.campaign)
        : emptyColorFlowCampaignProgress();

    return { daily, byMode: normalizedByMode, campaign };
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
      campaign: emptyColorFlowCampaignProgress(),
    };
  }

  return emptyColorFlowStoredStats();
}

function normalizeColorFlowCampaignProgress(value: unknown): ColorFlowCampaignProgress {
  const empty = emptyColorFlowCampaignProgress();
  if (!value || typeof value !== 'object') {
    return empty;
  }

  const raw = value as ColorFlowCampaignProgress;
  const seasons: Record<string, ColorFlowCampaignSeasonProgress> = { ...empty.seasons };

  if (raw.seasons && typeof raw.seasons === 'object') {
    for (const [seasonId, seasonRaw] of Object.entries(raw.seasons)) {
      if (!seasonRaw || typeof seasonRaw !== 'object') {
        continue;
      }
      const completedLevels = Array.isArray(seasonRaw.completedLevels)
        ? seasonRaw.completedLevels.filter((level) => Number.isInteger(level) && level > 0)
        : [];
      seasons[seasonId] = {
        highestUnlocked: Math.max(1, Number(seasonRaw.highestUnlocked) || 1),
        completedLevels: [...new Set(completedLevels)].sort((a, b) => a - b),
      };
    }
  }

  return {
    activeSeasonId: typeof raw.activeSeasonId === 'string' ? raw.activeSeasonId : empty.activeSeasonId,
    seasons,
  };
}
