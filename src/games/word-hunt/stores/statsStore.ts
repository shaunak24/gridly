import { create } from 'zustand';

import {
  loadWordHuntStats,
  saveWordHuntStats,
} from '../../../platform/sync/statsStorage';
import { pushIfSignedIn } from '../../../platform/sync/pushIfSignedIn';
import { getLocalDateKey } from '../core/dailyWord';
import { loadDailyCompletedDate, saveDailyCompletedDate } from '../../../platform/sync/dailyCompletion';
import {
  emptyWordHuntModeStats,
  emptyWordHuntStatsByMode,
  recordWordHuntModeResult,
  type WordHuntMode,
  type WordHuntModeStats,
  type WordHuntStatsByMode,
  type WordHuntStoredStats,
} from '../../../shared/stats/wordHuntModeStats';

/** @deprecated Use WordHuntModeStats — kept for sync migration helpers. */
export interface StatsData {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  distribution: number[];
}

interface StatsState {
  byMode: WordHuntStatsByMode;
  dailyCompletedDate: string | null;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  persist: () => Promise<void>;
  getModeStats: (mode: WordHuntMode) => WordHuntModeStats;
  recordResult: (mode: WordHuntMode, won: boolean, guessCount: number, elapsedSec: number) => Promise<void>;
  markDailyComplete: () => Promise<void>;
  isDailyCompleteToday: () => boolean;
}

export const useStatsStore = create<StatsState>((set, get) => ({
  byMode: emptyWordHuntStatsByMode(),
  dailyCompletedDate: null,
  hydrated: false,

  hydrate: async () => {
    const [stats, dailyCompleted] = await Promise.all([
      loadWordHuntStats(),
      loadDailyCompletedDate('word-hunt'),
    ]);

    set({
      byMode: stats?.byMode ?? emptyWordHuntStatsByMode(),
      dailyCompletedDate: dailyCompleted,
      hydrated: true,
    });
  },

  persist: async () => {
    const state = get();
    const payload: WordHuntStoredStats = { byMode: state.byMode };
    await saveWordHuntStats(payload);

    if (state.dailyCompletedDate) {
      await saveDailyCompletedDate('word-hunt', state.dailyCompletedDate);
    }
  },

  getModeStats: (mode) => get().byMode[mode] ?? emptyWordHuntModeStats(),

  recordResult: async (mode, won, guessCount, elapsedSec) => {
    const state = get();
    const nextMode = recordWordHuntModeResult(state.byMode[mode], won, guessCount, elapsedSec);
    const byMode = { ...state.byMode, [mode]: nextMode };

    set({ byMode });
    await saveWordHuntStats({ byMode });
    void pushIfSignedIn();
  },

  markDailyComplete: async () => {
    const today = getLocalDateKey();
    set({ dailyCompletedDate: today });
    await saveDailyCompletedDate('word-hunt', today);
    void pushIfSignedIn();
  },

  isDailyCompleteToday: () => {
    return get().dailyCompletedDate === getLocalDateKey();
  },
}));
