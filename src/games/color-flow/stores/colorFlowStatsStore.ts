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
import type { FlowDifficulty } from '../core/types';
import {
  emptyColorFlowModeStats,
  emptyColorFlowStatsByMode,
  recordColorFlowModeResult,
  type ColorFlowModeStats,
  type ColorFlowStatsByMode,
  type ColorFlowStoredStats,
} from '../../../shared/stats/colorFlowModeStats';

interface ColorFlowStatsState {
  byMode: ColorFlowStatsByMode;
  dailyCompletedDate: string | null;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  persist: () => Promise<void>;
  getModeStats: (difficulty: FlowDifficulty) => ColorFlowModeStats;
  recordResult: (difficulty: FlowDifficulty, won: boolean, elapsedSec: number) => Promise<void>;
  markDailyComplete: () => Promise<void>;
  isDailyCompleteToday: () => boolean;
}

export const useColorFlowStatsStore = create<ColorFlowStatsState>((set, get) => ({
  byMode: emptyColorFlowStatsByMode(),
  dailyCompletedDate: null,
  hydrated: false,

  hydrate: async () => {
    const [stats, dailyCompleted] = await Promise.all([
      loadColorFlowStats(),
      loadDailyCompletedDate('color-flow'),
    ]);

    set({
      byMode: stats?.byMode ?? emptyColorFlowStatsByMode(),
      dailyCompletedDate: dailyCompleted,
      hydrated: true,
    });
  },

  persist: async () => {
    const state = get();
    if (getActiveStatsUserId()) {
      await pushIfSignedIn();
      return;
    }

    const payload: ColorFlowStoredStats = { byMode: state.byMode };
    await saveColorFlowStats(payload);

    if (state.dailyCompletedDate) {
      await saveDailyCompletedDate('color-flow', state.dailyCompletedDate);
    }
  },

  getModeStats: (difficulty) => get().byMode[difficulty] ?? emptyColorFlowModeStats(),

  recordResult: async (difficulty, won, elapsedSec) => {
    const state = get();
    const nextMode = recordColorFlowModeResult(state.byMode[difficulty], won, elapsedSec);
    const byMode = { ...state.byMode, [difficulty]: nextMode };

    set({ byMode });
    if (getActiveStatsUserId()) {
      await pushIfSignedIn();
    } else {
      await saveColorFlowStats({ byMode });
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
