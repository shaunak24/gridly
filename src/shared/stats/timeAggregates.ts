export interface TimeAggregates {
  fastestSec: number | null;
  slowestSec: number | null;
  totalSec: number;
  completedCount: number;
}

export function emptyTimeAggregates(): TimeAggregates {
  return {
    fastestSec: null,
    slowestSec: null,
    totalSec: 0,
    completedCount: 0,
  };
}

export function recordElapsedTime(time: TimeAggregates, elapsedSec: number): TimeAggregates {
  const safeElapsed = Math.max(0, Math.floor(elapsedSec));
  return {
    fastestSec: time.fastestSec === null ? safeElapsed : Math.min(time.fastestSec, safeElapsed),
    slowestSec: time.slowestSec === null ? safeElapsed : Math.max(time.slowestSec, safeElapsed),
    totalSec: time.totalSec + safeElapsed,
    completedCount: time.completedCount + 1,
  };
}

export function averageElapsedSec(time: TimeAggregates): number | null {
  if (time.completedCount === 0) {
    return null;
  }
  return Math.round(time.totalSec / time.completedCount);
}

export function mergeTimeAggregates(a: TimeAggregates, b: TimeAggregates): TimeAggregates {
  const completedCount = a.completedCount + b.completedCount;
  const totalSec = a.totalSec + b.totalSec;

  let fastestSec = a.fastestSec;
  if (b.fastestSec !== null) {
    fastestSec = fastestSec === null ? b.fastestSec : Math.min(fastestSec, b.fastestSec);
  }

  let slowestSec = a.slowestSec;
  if (b.slowestSec !== null) {
    slowestSec = slowestSec === null ? b.slowestSec : Math.max(slowestSec, b.slowestSec);
  }

  return { fastestSec, slowestSec, totalSec, completedCount };
}
