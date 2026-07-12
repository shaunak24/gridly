import { create } from 'zustand';

import { getLocalDateKey } from '../core/dailyPuzzle';
import { loadJson, loadString, saveJson, saveString, storageKeys } from '../../../shared/services/storage';

export interface GridSnapStatsData {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
}

const emptyStats = (): GridSnapStatsData => ({
  gamesPlayed: 0,
  gamesWon: 0,
  currentStreak: 0,
  maxStreak: 0,
});

interface GridSnapStatsState extends GridSnapStatsData {
  dailyCompletedDate: string | null;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  recordResult: (won: boolean) => Promise<void>;
  markDailyComplete: () => Promise<void>;
  isDailyCompleteToday: () => boolean;
}

export const useGridSnapStatsStore = create<GridSnapStatsState>((set, get) => ({
  ...emptyStats(),
  dailyCompletedDate: null,
  hydrated: false,

  hydrate: async () => {
    const [stats, dailyCompleted] = await Promise.all([
      loadJson<GridSnapStatsData>(storageKeys.gridSnapStats),
      loadString(storageKeys.gridSnapDailyCompleted),
    ]);

    set({
      ...(stats ?? emptyStats()),
      dailyCompletedDate: dailyCompleted,
      hydrated: true,
    });
  },

  recordResult: async (won) => {
    const state = get();
    const gamesPlayed = state.gamesPlayed + 1;
    const gamesWon = state.gamesWon + (won ? 1 : 0);
    const currentStreak = won ? state.currentStreak + 1 : 0;
    const maxStreak = Math.max(state.maxStreak, currentStreak);

    const next = { gamesPlayed, gamesWon, currentStreak, maxStreak };
    set(next);
    await saveJson(storageKeys.gridSnapStats, next);
  },

  markDailyComplete: async () => {
    const today = getLocalDateKey();
    set({ dailyCompletedDate: today });
    await saveString(storageKeys.gridSnapDailyCompleted, today);
  },

  isDailyCompleteToday: () => get().dailyCompletedDate === getLocalDateKey(),
}));
