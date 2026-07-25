import {
  emptyGridSnapStatsByMode,
  mergeGridSnapStatsByMode,
  type GridSnapStatsByMode,
} from '../../shared/stats/gridSnapModeStats';
import {
  emptyWordHuntStatsByMode,
  mergeWordHuntStatsByMode,
  migrateLegacyGridSnapStats,
  migrateLegacyWordHuntStats,
  type WordHuntStatsByMode,
} from '../../shared/stats/wordHuntModeStats';
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

function wordHuntStatsFromLegacyRow(row: {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  distribution: number[];
}): WordHuntStatsByMode {
  return migrateLegacyWordHuntStats(row).byMode;
}

function gridSnapStatsFromLegacyRow(row: {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
}): GridSnapStatsByMode {
  return migrateLegacyGridSnapStats(row).byMode;
}

export function mergeGuestWordHuntStats(
  guest: WordHuntStatsCloud,
  cloud: WordHuntStatsCloud | null,
): WordHuntStatsCloud {
  if (!cloud) {
    return {
      statsByMode: guest.statsByMode,
      dailyCompletedDate: null,
      updatedAt: nowIso(),
    };
  }

  return {
    statsByMode: mergeWordHuntStatsByMode(guest.statsByMode, cloud.statsByMode),
    dailyCompletedDate: mergeDailyCompletedDate(guest.dailyCompletedDate, cloud.dailyCompletedDate),
    updatedAt: nowIso(),
  };
}

export function pickNewerWordHuntStats(
  local: WordHuntStatsCloud | null,
  cloud: WordHuntStatsCloud | null,
): WordHuntStatsCloud {
  if (!local) {
    return (
      cloud ?? {
        statsByMode: emptyWordHuntStatsByMode(),
        dailyCompletedDate: null,
        updatedAt: nowIso(),
      }
    );
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
      statsByMode: guest.statsByMode,
      dailyCompletedDate: null,
      updatedAt: nowIso(),
    };
  }

  return {
    statsByMode: mergeGridSnapStatsByMode(guest.statsByMode, cloud.statsByMode),
    dailyCompletedDate: mergeDailyCompletedDate(guest.dailyCompletedDate, cloud.dailyCompletedDate),
    updatedAt: nowIso(),
  };
}

export function pickNewerGridSnapStats(
  local: GridSnapStatsCloud | null,
  cloud: GridSnapStatsCloud | null,
): GridSnapStatsCloud {
  if (!local) {
    return (
      cloud ?? {
        statsByMode: emptyGridSnapStatsByMode(),
        dailyCompletedDate: null,
        updatedAt: nowIso(),
      }
    );
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
  statsByMode: WordHuntStatsByMode,
  dailyCompletedDate: string | null,
  updatedAt = nowIso(),
): WordHuntStatsCloud {
  return { statsByMode, dailyCompletedDate, updatedAt };
}

export function toGridSnapStatsCloud(
  statsByMode: GridSnapStatsByMode,
  dailyCompletedDate: string | null,
  updatedAt = nowIso(),
): GridSnapStatsCloud {
  return { statsByMode, dailyCompletedDate, updatedAt };
}

export { wordHuntStatsFromLegacyRow, gridSnapStatsFromLegacyRow };
