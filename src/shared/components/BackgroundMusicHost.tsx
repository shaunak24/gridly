import { useBackgroundMusic } from '../hooks/useBackgroundMusic';

/** Root-level host that keeps ambient music aligned with navigation and settings. */
export function BackgroundMusicHost() {
  useBackgroundMusic();
  return null;
}
