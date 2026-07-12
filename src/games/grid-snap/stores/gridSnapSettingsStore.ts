import { create } from 'zustand';

import { loadString, saveString, storageKeys } from '../../../shared/services/storage';
import type { SnapDifficulty } from '../core/types';

interface GridSnapSettingsState {
  difficulty: SnapDifficulty;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setDifficulty: (difficulty: SnapDifficulty) => Promise<void>;
}

export const useGridSnapSettingsStore = create<GridSnapSettingsState>((set) => ({
  difficulty: 'easy',
  hydrated: false,

  hydrate: async () => {
    const difficulty = await loadString(storageKeys.gridSnapDifficulty);
    set({
      difficulty:
        difficulty === 'medium' || difficulty === 'hard' || difficulty === 'easy'
          ? difficulty
          : 'easy',
      hydrated: true,
    });
  },

  setDifficulty: async (difficulty) => {
    set({ difficulty });
    await saveString(storageKeys.gridSnapDifficulty, difficulty);
  },
}));
