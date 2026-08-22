import { create } from 'zustand';

import {
  getActiveStatsUserId,
  loadColorFlowStats,
  saveColorFlowStats,
} from '../../../platform/sync/statsStorage';
import {
  loadDailyCompletedDate,
  saveDailyCompletedDate,
} from '../../../platform/sync/dailyCompletion';
import { pushIfSignedIn } from '../../../platform/sync/pushIfSignedIn';
import { getLocalDateKey } from '../core/dailyPuzzle';
import type { FlowDifficulty, FlowMode } from '../core/types';
import {
  emptyDailyChallengeStats,
  type DailyChallengeStats,
} from '../../../shared/stats/dailyChallengeStats';
import {
  emptyColorFlowModeStats,
  emptyColorFlowStatsByMode,
  emptyColorFlowStoredStats,
  recordColorFlowGameResult,
  type ColorFlowCampaignProgress,
  type ColorFlowModeStats,
  type ColorFlowStatsByMode,
  type ColorFlowStoredStats,
} from '../../../shared/stats/colorFlowModeStats';

interface ColorFlowStatsState {
  daily: DailyChallengeStats;
  byMode: ColorFlowStatsByMode;
  campaign: ColorFlowCampaignProgress;
  dailyCompletedDate: string | null;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  persist: () => Promise<void>;
  getModeStats: (difficulty: FlowDifficulty) => ColorFlowModeStats;
  getDailyStats: () => DailyChallengeStats;
  getCampaignProgress: () => ColorFlowCampaignProgress;
  setCampaignProgress: (campaign: ColorFlowCampaignProgress) => Promise<void>;
  recordResult: (
    difficulty: FlowDifficulty,
    mode: FlowMode,
    won: boolean,
    elapsedSec: number,
  ) => Promise<void>;
  markDailyComplete: () => Promise<void>;
  isDailyCompleteToday: () => boolean;
}

function toPayload(state: Pick<ColorFlowStatsState, 'daily' | 'byMode' | 'campaign'>): ColorFlowStoredStats {
  return { daily: state.daily, byMode: state.byMode, campaign: state.campaign };
}

export const useColorFlowStatsStore = create<ColorFlowStatsState>((set, get) => ({
  daily: emptyDailyChallengeStats(),
  byMode: emptyColorFlowStatsByMode(),
  campaign: emptyColorFlowStoredStats().campaign!,
  dailyCompletedDate: null,
  hydrated: false,

  hydrate: async () => {
    const [stats, dailyCompleted] = await Promise.all([
      loadColorFlowStats(),
      loadDailyCompletedDate('color-flow'),
    ]);

    const stored = stats ?? emptyColorFlowStoredStats();
    set({
      daily: stored.daily,
      byMode: stored.byMode,
      campaign: stored.campaign ?? emptyColorFlowStoredStats().campaign!,
      dailyCompletedDate: dailyCompleted,
      hydrated: true,
    });
  },

  persist: async () => {
    const state = get();
    await saveColorFlowStats(toPayload(state));

    if (state.dailyCompletedDate) {
      await saveDailyCompletedDate('color-flow', state.dailyCompletedDate);
    }

    if (getActiveStatsUserId()) {
      await pushIfSignedIn();
    }
  },

  getModeStats: (difficulty) => get().byMode[difficulty] ?? emptyColorFlowModeStats(),

  getDailyStats: () => get().daily,

  getCampaignProgress: () => get().campaign,

  setCampaignProgress: async (campaign) => {
    set({ campaign });
    const state = get();
    await saveColorFlowStats(toPayload(state));
    if (getActiveStatsUserId()) {
      await pushIfSignedIn();
    }
  },

  recordResult: async (difficulty, mode, won, elapsedSec) => {
    const state = get();
    const next = recordColorFlowGameResult(toPayload(state), difficulty, mode, won, elapsedSec);

    set({ daily: next.daily, byMode: next.byMode, campaign: next.campaign ?? state.campaign });
    await saveColorFlowStats(toPayload(get()));
    if (getActiveStatsUserId()) {
      await pushIfSignedIn();
    }
  },

  markDailyComplete: async () => {
    const today = getLocalDateKey();
    set({ dailyCompletedDate: today });
    if (getActiveStatsUserId()) {
      await pushIfSignedIn();
    } else {
      await saveDailyCompletedDate('color-flow', today);
    }
  },

  isDailyCompleteToday: () => get().dailyCompletedDate === getLocalDateKey(),
}));
