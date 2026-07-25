import { create } from 'zustand';

import {
  loadGridSnapStats,
  saveGridSnapStats,
} from '../../../platform/sync/statsStorage';
import {
  loadDailyCompletedDate,
  saveDailyCompletedDate,
} from '../../../platform/sync/dailyCompletion';
import { pushIfSignedIn } from '../../../platform/sync/pushIfSignedIn';
import { getLocalDateKey } from '../core/dailyPuzzle';
import type { SnapDifficulty } from '../core/types';
import {
  emptyGridSnapModeStats,
  emptyGridSnapStatsByMode,
  recordGridSnapModeResult,
  type GridSnapModeStats,
  type GridSnapStatsByMode,
  type GridSnapStoredStats,
} from '../../../shared/stats/gridSnapModeStats';

/** @deprecated Use GridSnapModeStats — kept for sync migration helpers. */
export interface GridSnapStatsData {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
}

interface GridSnapStatsState {
  byMode: GridSnapStatsByMode;
  dailyCompletedDate: string | null;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  persist: () => Promise<void>;
  getModeStats: (difficulty: SnapDifficulty) => GridSnapModeStats;
  recordResult: (difficulty: SnapDifficulty, won: boolean, elapsedSec: number) => Promise<void>;
  markDailyComplete: () => Promise<void>;
  isDailyCompleteToday: () => boolean;
}

export const useGridSnapStatsStore = create<GridSnapStatsState>((set, get) => ({
  byMode: emptyGridSnapStatsByMode(),
  dailyCompletedDate: null,
  hydrated: false,

  hydrate: async () => {
    const [stats, dailyCompleted] = await Promise.all([
      loadGridSnapStats(),
      loadDailyCompletedDate('grid-snap'),
    ]);

    set({
      byMode: stats?.byMode ?? emptyGridSnapStatsByMode(),
      dailyCompletedDate: dailyCompleted,
      hydrated: true,
    });
  },

  persist: async () => {
    const state = get();
    const payload: GridSnapStoredStats = { byMode: state.byMode };
    await saveGridSnapStats(payload);

    if (state.dailyCompletedDate) {
      await saveDailyCompletedDate('grid-snap', state.dailyCompletedDate);
    }
  },

  getModeStats: (difficulty) => get().byMode[difficulty] ?? emptyGridSnapModeStats(),

  recordResult: async (difficulty, won, elapsedSec) => {
    const state = get();
    const nextMode = recordGridSnapModeResult(state.byMode[difficulty], won, elapsedSec);
    const byMode = { ...state.byMode, [difficulty]: nextMode };

    set({ byMode });
    await saveGridSnapStats({ byMode });
    void pushIfSignedIn();
  },

  markDailyComplete: async () => {
    const today = getLocalDateKey();
    set({ dailyCompletedDate: today });
    await saveDailyCompletedDate('grid-snap', today);
    void pushIfSignedIn();
  },

  isDailyCompleteToday: () => get().dailyCompletedDate === getLocalDateKey(),
}));
