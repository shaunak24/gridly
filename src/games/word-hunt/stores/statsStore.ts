import { create } from 'zustand';

import {
  loadWordHuntStats,
  saveWordHuntStats,
} from '../../../platform/sync/statsStorage';
import { pushIfSignedIn } from '../../../platform/sync/pushIfSignedIn';
import { getLocalDateKey } from '../core/dailyWord';
import { loadDailyCompletedDate, saveDailyCompletedDate } from '../../../platform/sync/dailyCompletion';

export interface StatsData {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  distribution: number[];
}

const emptyStats = (): StatsData => ({
  gamesPlayed: 0,
  gamesWon: 0,
  currentStreak: 0,
  maxStreak: 0,
  distribution: [0, 0, 0, 0, 0, 0, 0],
});

interface StatsState extends StatsData {
  dailyCompletedDate: string | null;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  persist: () => Promise<void>;
  recordResult: (won: boolean, guessCount: number) => Promise<void>;
  markDailyComplete: () => Promise<void>;
  isDailyCompleteToday: () => boolean;
}

export const useStatsStore = create<StatsState>((set, get) => ({
  ...emptyStats(),
  dailyCompletedDate: null,
  hydrated: false,

  hydrate: async () => {
    const [stats, dailyCompleted] = await Promise.all([
      loadWordHuntStats(),
      loadDailyCompletedDate('word-hunt'),
    ]);

    set({
      ...(stats ?? emptyStats()),
      dailyCompletedDate: dailyCompleted,
      hydrated: true,
    });
  },

  persist: async () => {
    const state = get();
    await saveWordHuntStats({
      gamesPlayed: state.gamesPlayed,
      gamesWon: state.gamesWon,
      currentStreak: state.currentStreak,
      maxStreak: state.maxStreak,
      distribution: state.distribution,
    });

    if (state.dailyCompletedDate) {
      await saveDailyCompletedDate('word-hunt', state.dailyCompletedDate);
    }
  },

  recordResult: async (won, guessCount) => {
    const state = get();
    const gamesPlayed = state.gamesPlayed + 1;
    const gamesWon = state.gamesWon + (won ? 1 : 0);
    const currentStreak = won ? state.currentStreak + 1 : 0;
    const maxStreak = Math.max(state.maxStreak, currentStreak);
    const distribution = [...state.distribution];

    if (won && guessCount >= 1 && guessCount <= 6) {
      distribution[guessCount - 1] += 1;
    } else if (!won) {
      distribution[6] += 1;
    }

    const next = {
      gamesPlayed,
      gamesWon,
      currentStreak,
      maxStreak,
      distribution,
    };

    set(next);
    await saveWordHuntStats(next);
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
