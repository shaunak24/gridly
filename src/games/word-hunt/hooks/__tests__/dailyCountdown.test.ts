import {
  formatDailyCountdown,
  formatDailyCountdownTimer,
  getMillisecondsUntilNextDaily,
} from '../dailyCountdownUtil';

describe('dailyCountdown', () => {
  it('formats timer as MM:SS under one hour', () => {
    expect(formatDailyCountdownTimer(125_000)).toBe('02:05');
  });

  it('formats timer with hours when needed', () => {
    expect(formatDailyCountdownTimer(3_661_000)).toBe('1:01:01');
  });

  it('formats countdown label', () => {
    expect(formatDailyCountdown(90_000)).toBe('1m 30s');
  });

  it('returns non-negative ms until next daily', () => {
    const ms = getMillisecondsUntilNextDaily(new Date('2026-07-12T23:00:00'));
    expect(ms).toBeGreaterThan(0);
    expect(ms).toBeLessThanOrEqual(3_600_000);
  });
});
