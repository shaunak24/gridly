import { create } from 'zustand';

import { pushIfSignedIn } from '../../../platform/sync/pushIfSignedIn';
import { getLocalDateKey } from '../core/dailyWord';
import { loadJson, loadString, saveJson, saveString, storageKeys } from '../../../shared/services/storage';

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
      loadJson<StatsData>(storageKeys.stats),
      loadString(storageKeys.dailyCompleted),
    ]);

    set({
      ...(stats ?? emptyStats()),
      dailyCompletedDate: dailyCompleted,
      hydrated: true,
    });
  },

  persist: async () => {
    const state = get();
    await Promise.all([
      saveJson(storageKeys.stats, {
        gamesPlayed: state.gamesPlayed,
        gamesWon: state.gamesWon,
        currentStreak: state.currentStreak,
        maxStreak: state.maxStreak,
        distribution: state.distribution,
      }),
      state.dailyCompletedDate
        ? saveString(storageKeys.dailyCompleted, state.dailyCompletedDate)
        : Promise.resolve(),
    ]);
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
    await saveJson(storageKeys.stats, next);
    void pushIfSignedIn();
  },

  markDailyComplete: async () => {
    const today = getLocalDateKey();
    set({ dailyCompletedDate: today });
    await saveString(storageKeys.dailyCompleted, today);
    void pushIfSignedIn();
  },

  isDailyCompleteToday: () => {
    return get().dailyCompletedDate === getLocalDateKey();
  },
}));
