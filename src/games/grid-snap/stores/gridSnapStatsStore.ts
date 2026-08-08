import { create } from 'zustand';

import {
  getActiveStatsUserId,
  loadGridSnapStats,
  saveGridSnapStats,
} from '../../../platform/sync/statsStorage';
import {
  loadDailyCompletedDate,
  saveDailyCompletedDate,
} from '../../../platform/sync/dailyCompletion';
import { pushIfSignedIn } from '../../../platform/sync/pushIfSignedIn';
import { getLocalDateKey } from '../core/dailyPuzzle';
import type { SnapDifficulty, SnapMode } from '../core/types';
import {
  emptyDailyChallengeStats,
  type DailyChallengeStats,
} from '../../../shared/stats/dailyChallengeStats';
import {
  emptyGridSnapModeStats,
  emptyGridSnapStatsByMode,
  emptyGridSnapStoredStats,
  recordGridSnapGameResult,
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
  daily: DailyChallengeStats;
  byMode: GridSnapStatsByMode;
  dailyCompletedDate: string | null;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  persist: () => Promise<void>;
  getModeStats: (difficulty: SnapDifficulty) => GridSnapModeStats;
  getDailyStats: () => DailyChallengeStats;
  recordResult: (
    difficulty: SnapDifficulty,
    mode: SnapMode,
    won: boolean,
    elapsedSec: number,
  ) => Promise<void>;
  markDailyComplete: () => Promise<void>;
  isDailyCompleteToday: () => boolean;
}

function toPayload(state: Pick<GridSnapStatsState, 'daily' | 'byMode'>): GridSnapStoredStats {
  return { daily: state.daily, byMode: state.byMode };
}

export const useGridSnapStatsStore = create<GridSnapStatsState>((set, get) => ({
  daily: emptyDailyChallengeStats(),
  byMode: emptyGridSnapStatsByMode(),
  dailyCompletedDate: null,
  hydrated: false,

  hydrate: async () => {
    const [stats, dailyCompleted] = await Promise.all([
      loadGridSnapStats(),
      loadDailyCompletedDate('grid-snap'),
    ]);

    const stored = stats ?? emptyGridSnapStoredStats();
    set({
      daily: stored.daily,
      byMode: stored.byMode,
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

    await saveGridSnapStats(toPayload(state));

    if (state.dailyCompletedDate) {
      await saveDailyCompletedDate('grid-snap', state.dailyCompletedDate);
    }
  },

  getModeStats: (difficulty) => get().byMode[difficulty] ?? emptyGridSnapModeStats(),

  getDailyStats: () => get().daily,

  recordResult: async (difficulty, mode, won, elapsedSec) => {
    const state = get();
    const next = recordGridSnapGameResult(toPayload(state), difficulty, mode, won, elapsedSec);

    set({ daily: next.daily, byMode: next.byMode });
    if (getActiveStatsUserId()) {
      await pushIfSignedIn();
    } else {
      await saveGridSnapStats(next);
    }
  },

  markDailyComplete: async () => {
    const today = getLocalDateKey();
    set({ dailyCompletedDate: today });
    if (getActiveStatsUserId()) {
      await pushIfSignedIn();
    } else {
      await saveDailyCompletedDate('grid-snap', today);
    }
  },

  isDailyCompleteToday: () => get().dailyCompletedDate === getLocalDateKey(),
}));
