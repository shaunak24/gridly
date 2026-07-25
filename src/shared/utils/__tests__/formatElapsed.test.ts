import { formatElapsedOrDash, formatElapsedSeconds } from '../formatElapsed';

describe('formatElapsed', () => {
  it('formats seconds as mm:ss', () => {
    expect(formatElapsedSeconds(0)).toBe('00:00');
    expect(formatElapsedSeconds(65)).toBe('01:05');
    expect(formatElapsedSeconds(3599)).toBe('59:59');
  });

  it('shows em dash when no value', () => {
    expect(formatElapsedOrDash(null)).toBe('—');
    expect(formatElapsedOrDash(42)).toBe('00:42');
  });
});
