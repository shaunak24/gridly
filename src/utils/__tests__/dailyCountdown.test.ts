import { formatDailyCountdown, formatDailyCountdownTimer, getMillisecondsUntilNextDaily } from '../dailyCountdown';

describe('dailyCountdown', () => {
  it('returns milliseconds until next local midnight', () => {
    const now = new Date(2026, 6, 10, 20, 30, 0);
    const ms = getMillisecondsUntilNextDaily(now);
    expect(ms).toBe(3 * 60 * 60 * 1000 + 30 * 60 * 1000);
  });

  it('formats hours and minutes', () => {
    expect(formatDailyCountdown(3 * 60 * 60 * 1000 + 5 * 60 * 1000)).toBe('3h 05m');
  });

  it('formats minutes and seconds', () => {
    expect(formatDailyCountdown(90 * 1000)).toBe('1m 30s');
  });

  it('formats seconds only', () => {
    expect(formatDailyCountdown(45 * 1000)).toBe('45s');
  });
});

describe('formatDailyCountdownTimer', () => {
  it('formats hours as H:MM:SS', () => {
    expect(formatDailyCountdownTimer(3 * 60 * 60 * 1000 + 5 * 60 * 1000 + 9 * 1000)).toBe(
      '3:05:09',
    );
  });

  it('formats under one hour as MM:SS', () => {
    expect(formatDailyCountdownTimer(90 * 1000)).toBe('01:30');
  });

  it('pads minutes and seconds', () => {
    expect(formatDailyCountdownTimer(9 * 1000)).toBe('00:09');
  });
});
