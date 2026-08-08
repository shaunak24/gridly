export interface DailyChallengeStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
}

export function emptyDailyChallengeStats(): DailyChallengeStats {
  return {
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
  };
}

export function recordDailyChallengeResult(
  stats: DailyChallengeStats,
  won: boolean,
): DailyChallengeStats {
  const gamesPlayed = stats.gamesPlayed + 1;
  const gamesWon = stats.gamesWon + (won ? 1 : 0);
  const currentStreak = won ? stats.currentStreak + 1 : 0;
  const maxStreak = Math.max(stats.maxStreak, currentStreak);

  return {
    gamesPlayed,
    gamesWon,
    currentStreak,
    maxStreak,
  };
}

export function mergeDailyChallengeStats(
  a: DailyChallengeStats,
  b: DailyChallengeStats,
): DailyChallengeStats {
  return {
    gamesPlayed: a.gamesPlayed + b.gamesPlayed,
    gamesWon: a.gamesWon + b.gamesWon,
    currentStreak: Math.max(a.currentStreak, b.currentStreak),
    maxStreak: Math.max(a.maxStreak, b.maxStreak),
  };
}

/** Best-effort seed when upgrading from per-difficulty streak fields. */
export function deriveDailyFromModeStreaks(
  modes: Array<{ currentStreak: number; maxStreak: number }>,
): DailyChallengeStats {
  let currentStreak = 0;
  let maxStreak = 0;
  for (const mode of modes) {
    currentStreak = Math.max(currentStreak, mode.currentStreak);
    maxStreak = Math.max(maxStreak, mode.maxStreak);
  }

  return {
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak,
    maxStreak,
  };
}
