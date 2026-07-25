import { useEffect, useState } from 'react';

import { formatElapsedSeconds } from '../utils/formatElapsed';

interface UseGameTimerOptions {
  active: boolean;
  resetKey: number | string;
  getBaseElapsedSec: () => number;
  onTick: (elapsedSec: number) => void;
}

export function useGameTimer({ active, resetKey, getBaseElapsedSec, onTick }: UseGameTimerOptions) {
  const [displaySec, setDisplaySec] = useState(0);

  useEffect(() => {
    if (!active) {
      return;
    }

    const base = getBaseElapsedSec();
    const startedAt = Date.now();
    setDisplaySec(base);

    const update = () => {
      const next = base + Math.floor((Date.now() - startedAt) / 1000);
      setDisplaySec(next);
      onTick(next);
    };

    update();
    const intervalId = setInterval(update, 1000);
    return () => {
      clearInterval(intervalId);
      const finalSec = base + Math.floor((Date.now() - startedAt) / 1000);
      onTick(finalSec);
    };
  }, [active, resetKey, getBaseElapsedSec, onTick]);

  return {
    elapsedSec: displaySec,
    display: formatElapsedSeconds(displaySec),
  };
}
