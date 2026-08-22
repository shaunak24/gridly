import { usePathname } from 'expo-router';
import { useEffect } from 'react';

import { useAppSettingsStore } from '../stores/appSettingsStore';
import {
  setBackgroundMusicActive,
  setBackgroundMusicEnabled,
} from '../services/backgroundMusic';

function shouldPlayMusicOnRoute(pathname: string): boolean {
  if (pathname === '/' || pathname.startsWith('/auth')) {
    return false;
  }
  return true;
}

/**
 * Keeps ambient background music in sync with route and the app-wide music toggle.
 */
export function useBackgroundMusic(): void {
  const pathname = usePathname();
  const musicEnabled = useAppSettingsStore((state) => state.musicEnabled);
  const hydrated = useAppSettingsStore((state) => state.hydrated);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    setBackgroundMusicEnabled(musicEnabled);
  }, [hydrated, musicEnabled]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    const active = musicEnabled && shouldPlayMusicOnRoute(pathname);
    setBackgroundMusicActive(active);
  }, [hydrated, musicEnabled, pathname]);
}
