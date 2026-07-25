import type { GridSnapStatsData } from '../../games/grid-snap/stores/gridSnapStatsStore';
import type { StatsData } from '../../games/word-hunt/stores/statsStore';
import type {
  AppSettingsCloud,
  GridSnapSettingsCloud,
  GridSnapStatsCloud,
  Timestamped,
  WordHuntSettingsCloud,
  WordHuntStatsCloud,
} from './types';

export function nowIso(): string {
  return new Date().toISOString();
}

/** Guest device daily completion must not bleed into a signed-in account on merge. */
function mergeDailyCompletedDate(
  _local: string | null,
  cloud: string | null,
): string | null {
  if (cloud) {
    return cloud;
  }

  return null;
}

function pickLatest<T extends Timestamped>(local: T, cloud: T | null): T {
  if (!cloud) {
    return local;
  }
  return local.updatedAt >= cloud.updatedAt ? local : cloud;
}

export function mergeGuestWordHuntStats(
  guest: WordHuntStatsCloud,
  cloud: WordHuntStatsCloud | null,
): WordHuntStatsCloud {
  if (!cloud) {
    return {
      ...guest,
      dailyCompletedDate: null,
      updatedAt: nowIso(),
    };
  }

  const distribution = guest.distribution.map((value, index) => value + (cloud.distribution[index] ?? 0));

  return {
    gamesPlayed: guest.gamesPlayed + cloud.gamesPlayed,
    gamesWon: guest.gamesWon + cloud.gamesWon,
    currentStreak: Math.max(guest.currentStreak, cloud.currentStreak),
    maxStreak: Math.max(guest.maxStreak, cloud.maxStreak),
    distribution,
    dailyCompletedDate: mergeDailyCompletedDate(guest.dailyCompletedDate, cloud.dailyCompletedDate),
    updatedAt: nowIso(),
  };
}

export function pickNewerWordHuntStats(
  local: WordHuntStatsCloud | null,
  cloud: WordHuntStatsCloud | null,
): WordHuntStatsCloud {
  if (!local) {
    return cloud ?? {
      gamesPlayed: 0,
      gamesWon: 0,
      currentStreak: 0,
      maxStreak: 0,
      distribution: [0, 0, 0, 0, 0, 0, 0],
      dailyCompletedDate: null,
      updatedAt: nowIso(),
    };
  }

  if (!cloud) {
    return local;
  }

  return local.updatedAt >= cloud.updatedAt ? local : cloud;
}

export function mergeGuestGridSnapStats(
  guest: GridSnapStatsCloud,
  cloud: GridSnapStatsCloud | null,
): GridSnapStatsCloud {
  if (!cloud) {
    return {
      ...guest,
      dailyCompletedDate: null,
      updatedAt: nowIso(),
    };
  }

  return {
    gamesPlayed: guest.gamesPlayed + cloud.gamesPlayed,
    gamesWon: guest.gamesWon + cloud.gamesWon,
    currentStreak: Math.max(guest.currentStreak, cloud.currentStreak),
    maxStreak: Math.max(guest.maxStreak, cloud.maxStreak),
    dailyCompletedDate: mergeDailyCompletedDate(guest.dailyCompletedDate, cloud.dailyCompletedDate),
    updatedAt: nowIso(),
  };
}

export function pickNewerGridSnapStats(
  local: GridSnapStatsCloud | null,
  cloud: GridSnapStatsCloud | null,
): GridSnapStatsCloud {
  if (!local) {
    return cloud ?? {
      gamesPlayed: 0,
      gamesWon: 0,
      currentStreak: 0,
      maxStreak: 0,
      dailyCompletedDate: null,
      updatedAt: nowIso(),
    };
  }

  if (!cloud) {
    return local;
  }

  return local.updatedAt >= cloud.updatedAt ? local : cloud;
}

/** @deprecated Use mergeGuestWordHuntStats — sums guest progress into cloud on sign-in only. */
export function mergeWordHuntStats(
  guest: WordHuntStatsCloud,
  cloud: WordHuntStatsCloud | null,
): WordHuntStatsCloud {
  return mergeGuestWordHuntStats(guest, cloud);
}

/** @deprecated Use mergeGuestGridSnapStats */
export function mergeGridSnapStats(
  guest: GridSnapStatsCloud,
  cloud: GridSnapStatsCloud | null,
): GridSnapStatsCloud {
  return mergeGuestGridSnapStats(guest, cloud);
}

export function mergeWordHuntSettings(
  local: WordHuntSettingsCloud,
  cloud: WordHuntSettingsCloud | null,
): WordHuntSettingsCloud {
  return pickLatest(local, cloud);
}

export function mergeGridSnapSettings(
  local: GridSnapSettingsCloud,
  cloud: GridSnapSettingsCloud | null,
): GridSnapSettingsCloud {
  return pickLatest(local, cloud);
}

export function mergeAppSettings(
  local: AppSettingsCloud,
  cloud: AppSettingsCloud | null,
): AppSettingsCloud {
  return pickLatest(local, cloud);
}

export function toWordHuntStatsCloud(
  stats: StatsData,
  dailyCompletedDate: string | null,
  updatedAt = nowIso(),
): WordHuntStatsCloud {
  return { ...stats, dailyCompletedDate, updatedAt };
}

export function toGridSnapStatsCloud(
  stats: GridSnapStatsData,
  dailyCompletedDate: string | null,
  updatedAt = nowIso(),
): GridSnapStatsCloud {
  return { ...stats, dailyCompletedDate, updatedAt };
}
