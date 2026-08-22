import { useEffect } from 'react';

import { setMusicUrgency } from '../services/backgroundMusic';

interface UseMusicUrgencyOptions {
  active: boolean;
  remainingSec: number;
}

/**
 * Subtly raises background-music tempo when a timed puzzle is running low.
 */
export function useMusicUrgency({ active, remainingSec }: UseMusicUrgencyOptions): void {
  useEffect(() => {
    if (!active) {
      setMusicUrgency(null);
      return;
    }

    setMusicUrgency(remainingSec);
    return () => {
      setMusicUrgency(null);
    };
  }, [active, remainingSec]);
}
