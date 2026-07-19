import { create } from 'zustand';

import { pushIfSignedIn } from '../../platform/sync/pushIfSignedIn';
import { loadString, saveString, storageKeys } from '../services/storage';
import type { ThemePreference } from '../theme/colors';

interface AppSettingsState {
  theme: ThemePreference;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  persist: () => Promise<void>;
  setTheme: (theme: ThemePreference) => Promise<void>;
}

export const useAppSettingsStore = create<AppSettingsState>((set, get) => ({
  theme: 'system',
  hydrated: false,

  hydrate: async () => {
    const theme = await loadString(storageKeys.theme);
    set({
      theme: (theme as ThemePreference) ?? 'system',
      hydrated: true,
    });
  },

  persist: async () => {
    await saveString(storageKeys.theme, get().theme);
  },

  setTheme: async (theme) => {
    set({ theme });
    await saveString(storageKeys.theme, theme);
    void pushIfSignedIn();
  },
}));
