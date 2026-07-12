import { useEffect, useState } from 'react';

import { getMillisecondsUntilNextDaily } from './dailyCountdownUtil';

export function useDailyCountdown(active: boolean): number {
  const [remainingMs, setRemainingMs] = useState(() => getMillisecondsUntilNextDaily());

  useEffect(() => {
    if (!active) {
      return;
    }

    const update = () => setRemainingMs(getMillisecondsUntilNextDaily());
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [active]);

  return remainingMs;
}
