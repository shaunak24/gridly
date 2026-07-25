import {
  averageElapsedSec,
  emptyTimeAggregates,
  mergeTimeAggregates,
  recordElapsedTime,
} from '../timeAggregates';

describe('timeAggregates', () => {
  it('records fastest, slowest, and average elapsed time', () => {
    const first = recordElapsedTime(emptyTimeAggregates(), 90);
    const second = recordElapsedTime(first, 45);
    const third = recordElapsedTime(second, 120);

    expect(third.fastestSec).toBe(45);
    expect(third.slowestSec).toBe(120);
    expect(third.completedCount).toBe(3);
    expect(averageElapsedSec(third)).toBe(85);
  });

  it('merges time aggregates with min fastest and max slowest', () => {
    const local = recordElapsedTime(emptyTimeAggregates(), 60);
    const cloud = recordElapsedTime(emptyTimeAggregates(), 30);
    const merged = mergeTimeAggregates(local, cloud);

    expect(merged.fastestSec).toBe(30);
    expect(merged.slowestSec).toBe(60);
    expect(merged.completedCount).toBe(2);
    expect(averageElapsedSec(merged)).toBe(45);
  });
});
