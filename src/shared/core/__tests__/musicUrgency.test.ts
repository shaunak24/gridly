import {
  MUSIC_BASE_PLAYBACK_RATE,
  MUSIC_HIGH_URGENCY_RATE,
  MUSIC_MID_URGENCY_RATE,
  playbackRateForRemaining,
} from '../musicUrgency';

describe('playbackRateForRemaining', () => {
  it('returns base rate when untimed or comfortable', () => {
    expect(playbackRateForRemaining(null)).toBe(MUSIC_BASE_PLAYBACK_RATE);
    expect(playbackRateForRemaining(120)).toBe(MUSIC_BASE_PLAYBACK_RATE);
    expect(playbackRateForRemaining(60)).toBe(MUSIC_BASE_PLAYBACK_RATE);
  });

  it('ramps between 60s and 30s', () => {
    expect(playbackRateForRemaining(45)).toBeCloseTo(1.03, 2);
    expect(playbackRateForRemaining(30)).toBeCloseTo(MUSIC_MID_URGENCY_RATE, 2);
  });

  it('ramps toward peak urgency below 30s', () => {
    expect(playbackRateForRemaining(15)).toBeCloseTo(1.09, 2);
    expect(playbackRateForRemaining(0)).toBeCloseTo(MUSIC_HIGH_URGENCY_RATE, 2);
  });
});
