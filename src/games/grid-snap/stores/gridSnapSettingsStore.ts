import { create } from 'zustand';

import { loadString, saveString, storageKeys } from '../../../shared/services/storage';
import { clearSavedGridSnapGames } from '../core/persistence';
import type { SnapDifficulty } from '../core/types';

interface GridSnapSettingsState {
  difficulty: SnapDifficulty;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  ensureHydrated: () => Promise<void>;
  setDifficulty: (difficulty: SnapDifficulty) => Promise<void>;
}

let hydrationPromise: Promise<void> | null = null;

export const useGridSnapSettingsStore = create<GridSnapSettingsState>((set, get) => ({
  difficulty: 'easy',
  hydrated: false,

  hydrate: async () => {
    if (get().hydrated) {
      return;
    }

    if (!hydrationPromise) {
      hydrationPromise = (async () => {
        const stored = await loadString(storageKeys.gridSnapDifficulty);
        set({
          difficulty:
            stored === 'medium' || stored === 'hard' || stored === 'easy' ? stored : 'easy',
          hydrated: true,
        });
      })();
    }

    try {
      await hydrationPromise;
    } finally {
      hydrationPromise = null;
    }
  },

  ensureHydrated: async () => {
    if (get().hydrated) {
      return;
    }
    await get().hydrate();
  },

  setDifficulty: async (difficulty) => {
    set({ difficulty, hydrated: true });
    await saveString(storageKeys.gridSnapDifficulty, difficulty);
    await clearSavedGridSnapGames();
  },
}));
