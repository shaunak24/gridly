import {
  emptyGridSnapStoredStats,
  recordGridSnapGameResult,
} from '../gridSnapModeStats';

describe('recordGridSnapGameResult', () => {
  it('updates daily streak only for daily mode', () => {
    let stored = emptyGridSnapStoredStats();

    stored = recordGridSnapGameResult(stored, 'easy', 'practice', true, 60);
    expect(stored.daily.currentStreak).toBe(0);
    expect(stored.byMode.easy.gamesPlayed).toBe(1);

    stored = recordGridSnapGameResult(stored, 'easy', 'daily', true, 45);
    expect(stored.daily.currentStreak).toBe(1);

    stored = recordGridSnapGameResult(stored, 'easy', 'daily', false, 300);
    expect(stored.daily.currentStreak).toBe(0);
    expect(stored.daily.gamesPlayed).toBe(2);
  });

  it('does not record time on loss', () => {
    let stored = emptyGridSnapStoredStats();
    stored = recordGridSnapGameResult(stored, 'medium', 'practice', false, 120);
    expect(stored.byMode.medium.gamesPlayed).toBe(1);
    expect(stored.byMode.medium.gamesWon).toBe(0);
    expect(stored.byMode.medium.time.completedCount).toBe(0);
  });
});
