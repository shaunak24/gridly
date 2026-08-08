import { useEffect, useRef } from 'react';

import { useGameTimer } from './useGameTimer';
import { formatElapsedSeconds } from '../utils/formatElapsed';

interface UseGameTimeLimitOptions {
  active: boolean;
  resetKey: number | string;
  getBaseElapsedSec: () => number;
  onTick: (elapsedSec: number) => void;
  limitSec: number;
  onTimeUp: () => void;
}

export function useGameTimeLimit({
  active,
  resetKey,
  getBaseElapsedSec,
  onTick,
  limitSec,
  onTimeUp,
}: UseGameTimeLimitOptions) {
  const firedRef = useRef(false);
  const { display: elapsedDisplay, elapsedSec } = useGameTimer({
    active,
    resetKey,
    getBaseElapsedSec,
    onTick,
  });

  useEffect(() => {
    firedRef.current = false;
  }, [resetKey]);

  useEffect(() => {
    if (!active || firedRef.current) {
      return;
    }

    if (elapsedSec >= limitSec) {
      firedRef.current = true;
      onTimeUp();
    }
  }, [active, elapsedSec, limitSec, onTimeUp]);

  const remainingSec = Math.max(0, limitSec - elapsedSec);

  return {
    elapsedSec,
    elapsedDisplay,
    remainingSec,
    remainingDisplay: formatElapsedSeconds(remainingSec),
    limitSec,
  };
}
