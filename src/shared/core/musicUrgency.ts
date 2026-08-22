/** Playback rate when the countdown is comfortable (≥ 60 s remaining). */
export const MUSIC_BASE_PLAYBACK_RATE = 1;

/** Playback rate at 30 s remaining (gentle urgency). */
export const MUSIC_MID_URGENCY_RATE = 1.06;

/** Playback rate at 0 s remaining (peak urgency, still subtle). */
export const MUSIC_HIGH_URGENCY_RATE = 1.12;

const MID_THRESHOLD_SEC = 60;
const HIGH_THRESHOLD_SEC = 30;

/**
 * Maps countdown remaining seconds to a subtle playback-rate bump for timed modes.
 * Returns 1.0 when remaining is null (untimed play or music idle).
 */
export function playbackRateForRemaining(remainingSec: number | null): number {
  if (remainingSec === null || remainingSec >= MID_THRESHOLD_SEC) {
    return MUSIC_BASE_PLAYBACK_RATE;
  }

  if (remainingSec >= HIGH_THRESHOLD_SEC) {
    const progress = (MID_THRESHOLD_SEC - remainingSec) / (MID_THRESHOLD_SEC - HIGH_THRESHOLD_SEC);
    return MUSIC_BASE_PLAYBACK_RATE + (MUSIC_MID_URGENCY_RATE - MUSIC_BASE_PLAYBACK_RATE) * progress;
  }

  const progress = (HIGH_THRESHOLD_SEC - remainingSec) / HIGH_THRESHOLD_SEC;
  return MUSIC_MID_URGENCY_RATE + (MUSIC_HIGH_URGENCY_RATE - MUSIC_MID_URGENCY_RATE) * progress;
}
