import { create } from 'zustand';

import { loadString, saveString, storageKeys } from '../services/storage';
import type { ThemePreference } from '../theme/colors';

interface AppSettingsState {
  theme: ThemePreference;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setTheme: (theme: ThemePreference) => Promise<void>;
}

export const useAppSettingsStore = create<AppSettingsState>((set) => ({
  theme: 'system',
  hydrated: false,

  hydrate: async () => {
    const theme = await loadString(storageKeys.theme);
    set({
      theme: (theme as ThemePreference) ?? 'system',
      hydrated: true,
    });
  },

  setTheme: async (theme) => {
    set({ theme });
    await saveString(storageKeys.theme, theme);
  },
}));
