import { create } from 'zustand';

import { pushIfSignedIn } from '../../platform/sync/pushIfSignedIn';
import { loadString, saveString, storageKeys } from '../services/storage';
import type { ThemePreference } from '../theme/colors';

interface AppSettingsState {
  theme: ThemePreference;
  musicEnabled: boolean;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  persist: () => Promise<void>;
  setTheme: (theme: ThemePreference) => Promise<void>;
  setMusicEnabled: (enabled: boolean) => Promise<void>;
}

function parseMusicEnabled(raw: string | null): boolean {
  if (raw === '0' || raw === 'false') {
    return false;
  }
  return true;
}

export const useAppSettingsStore = create<AppSettingsState>((set, get) => ({
  theme: 'system',
  musicEnabled: true,
  hydrated: false,

  hydrate: async () => {
    const [theme, musicEnabled] = await Promise.all([
      loadString(storageKeys.theme),
      loadString(storageKeys.musicEnabled),
    ]);
    set({
      theme: (theme as ThemePreference) ?? 'system',
      musicEnabled: parseMusicEnabled(musicEnabled),
      hydrated: true,
    });
  },

  persist: async () => {
    const { theme, musicEnabled } = get();
    await Promise.all([
      saveString(storageKeys.theme, theme),
      saveString(storageKeys.musicEnabled, musicEnabled ? '1' : '0'),
    ]);
  },

  setTheme: async (theme) => {
    set({ theme });
    await saveString(storageKeys.theme, theme);
    void pushIfSignedIn();
  },

  setMusicEnabled: async (musicEnabled) => {
    set({ musicEnabled });
    await saveString(storageKeys.musicEnabled, musicEnabled ? '1' : '0');
    void pushIfSignedIn();
  },
}));
