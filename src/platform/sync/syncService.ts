import { useGridSnapSettingsStore } from '../../games/grid-snap/stores/gridSnapSettingsStore';
import { useGridSnapStatsStore } from '../../games/grid-snap/stores/gridSnapStatsStore';
import { useWordHuntSettingsStore } from '../../games/word-hunt/stores/wordHuntSettingsStore';
import { useStatsStore } from '../../games/word-hunt/stores/statsStore';
import { scheduleGameReminder } from '../../services/notifications';
import { useAppSettingsStore } from '../../shared/stores/appSettingsStore';
import { loadDailyCompletedDate, saveDailyCompletedDate } from './dailyCompletion';
import { fetchCloudSnapshot, upsertCloudSnapshot } from './cloudRepository';
import {
  mergeAppSettings,
  mergeGridSnapSettings,
  mergeGuestGridSnapStats,
  mergeGuestWordHuntStats,
  mergeWordHuntSettings,
  nowIso,
  pickNewerGridSnapStats,
  pickNewerWordHuntStats,
  toGridSnapStatsCloud,
  toWordHuntStatsCloud,
} from './mergePolicy';
import {
  emptyGridSnapStats,
  emptyWordHuntStats,
  loadGuestGridSnapStats,
  loadGuestWordHuntStats,
  loadUserGridSnapStats,
  loadUserWordHuntStats,
  resetGuestStats,
  saveUserGridSnapStats,
  saveUserWordHuntStats,
} from './statsStorage';
import type { UserCloudSnapshot } from './types';

function collectSettingsSnapshot(): Pick<
  UserCloudSnapshot,
  'wordHuntSettings' | 'gridSnapSettings' | 'appSettings'
> {
  const wordHuntSettingsState = useWordHuntSettingsStore.getState();
  const gridSnapSettingsState = useGridSnapSettingsStore.getState();
  const appSettingsState = useAppSettingsStore.getState();
  const timestamp = nowIso();

  return {
    wordHuntSettings: {
      hardMode: wordHuntSettingsState.hardMode,
      notificationsEnabled: wordHuntSettingsState.notificationsEnabled,
      reminderHour: wordHuntSettingsState.reminderHour,
      reminderMinute: wordHuntSettingsState.reminderMinute,
      updatedAt: timestamp,
    },
    gridSnapSettings: {
      difficulty: gridSnapSettingsState.difficulty,
      notificationsEnabled: gridSnapSettingsState.notificationsEnabled,
      reminderHour: gridSnapSettingsState.reminderHour,
      reminderMinute: gridSnapSettingsState.reminderMinute,
      updatedAt: timestamp,
    },
    appSettings: {
      theme: appSettingsState.theme,
      updatedAt: timestamp,
    },
  };
}

function collectSignedInStatsSnapshot(): Pick<UserCloudSnapshot, 'wordHuntStats' | 'gridSnapStats'> {
  const wordHuntStatsState = useStatsStore.getState();
  const gridSnapStatsState = useGridSnapStatsStore.getState();
  const timestamp = nowIso();

  return {
    wordHuntStats: toWordHuntStatsCloud(
      {
        gamesPlayed: wordHuntStatsState.gamesPlayed,
        gamesWon: wordHuntStatsState.gamesWon,
        currentStreak: wordHuntStatsState.currentStreak,
        maxStreak: wordHuntStatsState.maxStreak,
        distribution: wordHuntStatsState.distribution,
      },
      wordHuntStatsState.dailyCompletedDate,
      timestamp,
    ),
    gridSnapStats: toGridSnapStatsCloud(
      {
        gamesPlayed: gridSnapStatsState.gamesPlayed,
        gamesWon: gridSnapStatsState.gamesWon,
        currentStreak: gridSnapStatsState.currentStreak,
        maxStreak: gridSnapStatsState.maxStreak,
      },
      gridSnapStatsState.dailyCompletedDate,
      timestamp,
    ),
  };
}

async function loadGuestStatsSnapshot(): Promise<Pick<UserCloudSnapshot, 'wordHuntStats' | 'gridSnapStats'>> {
  const [wordHuntStats, gridSnapStats, wordHuntDaily, gridSnapDaily] = await Promise.all([
    loadGuestWordHuntStats(),
    loadGuestGridSnapStats(),
    loadGuestDailyCompletedDate('word-hunt'),
    loadGuestDailyCompletedDate('grid-snap'),
  ]);
  const timestamp = nowIso();

  return {
    wordHuntStats: toWordHuntStatsCloud(wordHuntStats ?? emptyWordHuntStats(), wordHuntDaily, timestamp),
    gridSnapStats: toGridSnapStatsCloud(gridSnapStats ?? emptyGridSnapStats(), gridSnapDaily, timestamp),
  };
}

async function loadUserStatsSnapshot(
  userId: string,
): Promise<{
  wordHunt: WordHuntStatsCloud | null;
  gridSnap: GridSnapStatsCloud | null;
}> {
  const [wordHuntStats, gridSnapStats] = await Promise.all([
    loadUserWordHuntStats(userId),
    loadUserGridSnapStats(userId),
  ]);

  return {
    wordHunt: wordHuntStats
      ? toWordHuntStatsCloud(
          {
            gamesPlayed: wordHuntStats.gamesPlayed,
            gamesWon: wordHuntStats.gamesWon,
            currentStreak: wordHuntStats.currentStreak,
            maxStreak: wordHuntStats.maxStreak,
            distribution: wordHuntStats.distribution,
          },
          null,
          wordHuntStats.updatedAt,
        )
      : null,
    gridSnap: gridSnapStats
      ? toGridSnapStatsCloud(
          {
            gamesPlayed: gridSnapStats.gamesPlayed,
            gamesWon: gridSnapStats.gamesWon,
            currentStreak: gridSnapStats.currentStreak,
            maxStreak: gridSnapStats.maxStreak,
          },
          null,
          gridSnapStats.updatedAt,
        )
      : null,
  };
}

async function persistUserStatsCache(
  userId: string,
  snapshot: Pick<UserCloudSnapshot, 'wordHuntStats' | 'gridSnapStats'>,
): Promise<void> {
  await Promise.all([
    saveUserWordHuntStats(
      userId,
      {
        gamesPlayed: snapshot.wordHuntStats.gamesPlayed,
        gamesWon: snapshot.wordHuntStats.gamesWon,
        currentStreak: snapshot.wordHuntStats.currentStreak,
        maxStreak: snapshot.wordHuntStats.maxStreak,
        distribution: snapshot.wordHuntStats.distribution,
      },
      snapshot.wordHuntStats.updatedAt,
    ),
    saveUserGridSnapStats(
      userId,
      {
        gamesPlayed: snapshot.gridSnapStats.gamesPlayed,
        gamesWon: snapshot.gridSnapStats.gamesWon,
        currentStreak: snapshot.gridSnapStats.currentStreak,
        maxStreak: snapshot.gridSnapStats.maxStreak,
      },
      snapshot.gridSnapStats.updatedAt,
    ),
  ]);
}

async function applySnapshot(snapshot: UserCloudSnapshot): Promise<void> {
  const { wordHuntStats, gridSnapStats, wordHuntSettings, gridSnapSettings, appSettings } = snapshot;

  useStatsStore.setState({
    gamesPlayed: wordHuntStats.gamesPlayed,
    gamesWon: wordHuntStats.gamesWon,
    currentStreak: wordHuntStats.currentStreak,
    maxStreak: wordHuntStats.maxStreak,
    distribution: wordHuntStats.distribution,
    dailyCompletedDate: wordHuntStats.dailyCompletedDate,
    hydrated: true,
  });

  useGridSnapStatsStore.setState({
    gamesPlayed: gridSnapStats.gamesPlayed,
    gamesWon: gridSnapStats.gamesWon,
    currentStreak: gridSnapStats.currentStreak,
    maxStreak: gridSnapStats.maxStreak,
    dailyCompletedDate: gridSnapStats.dailyCompletedDate,
    hydrated: true,
  });

  useWordHuntSettingsStore.setState({
    hardMode: wordHuntSettings.hardMode,
    notificationsEnabled: wordHuntSettings.notificationsEnabled,
    reminderHour: wordHuntSettings.reminderHour,
    reminderMinute: wordHuntSettings.reminderMinute,
    hydrated: true,
  });

  useGridSnapSettingsStore.setState({
    difficulty: gridSnapSettings.difficulty,
    notificationsEnabled: gridSnapSettings.notificationsEnabled,
    reminderHour: gridSnapSettings.reminderHour,
    reminderMinute: gridSnapSettings.reminderMinute,
    hydrated: true,
  });

  useAppSettingsStore.setState({
    theme: appSettings.theme,
    hydrated: true,
  });

  await Promise.all([
    useStatsStore.getState().persist?.(),
    useGridSnapStatsStore.getState().persist?.(),
    useWordHuntSettingsStore.getState().persist?.(),
    useGridSnapSettingsStore.getState().persist?.(),
    useAppSettingsStore.getState().persist?.(),
    wordHuntStats.dailyCompletedDate
      ? saveDailyCompletedDate('word-hunt', wordHuntStats.dailyCompletedDate)
      : Promise.resolve(),
    gridSnapStats.dailyCompletedDate
      ? saveDailyCompletedDate('grid-snap', gridSnapStats.dailyCompletedDate)
      : Promise.resolve(),
    scheduleGameReminder(
      'word-hunt',
      wordHuntSettings.notificationsEnabled,
      wordHuntSettings.reminderHour,
      wordHuntSettings.reminderMinute,
    ),
    scheduleGameReminder(
      'grid-snap',
      gridSnapSettings.notificationsEnabled,
      gridSnapSettings.reminderHour,
      gridSnapSettings.reminderMinute,
    ),
  ]);
}

export async function loadSignedInUserStores(userId: string): Promise<void> {
  const [cloud, localUser, settings, userWordHuntDaily, userGridSnapDaily] = await Promise.all([
    fetchCloudSnapshot(userId),
    loadUserStatsSnapshot(userId),
    collectSettingsSnapshot(),
    loadDailyCompletedDate('word-hunt'),
    loadDailyCompletedDate('grid-snap'),
  ]);

  const wordHuntStats = pickNewerWordHuntStats(localUser.wordHunt, cloud.wordHuntStats ?? null);
  const gridSnapStats = pickNewerGridSnapStats(localUser.gridSnap, cloud.gridSnapStats ?? null);

  wordHuntStats.dailyCompletedDate =
    cloud.wordHuntStats?.dailyCompletedDate ?? userWordHuntDaily ?? null;
  gridSnapStats.dailyCompletedDate =
    cloud.gridSnapStats?.dailyCompletedDate ?? userGridSnapDaily ?? null;

  const snapshot: UserCloudSnapshot = {
    wordHuntStats,
    gridSnapStats,
    wordHuntSettings: mergeWordHuntSettings(settings.wordHuntSettings, cloud.wordHuntSettings ?? null),
    gridSnapSettings: mergeGridSnapSettings(settings.gridSnapSettings, cloud.gridSnapSettings ?? null),
    appSettings: mergeAppSettings(settings.appSettings, cloud.appSettings ?? null),
  };

  await applySnapshot(snapshot);
  await persistUserStatsCache(userId, snapshot);
}

export async function mergeLocalToCloud(userId: string): Promise<void> {
  const [guestStats, cloud, settings] = await Promise.all([
    loadGuestStatsSnapshot(),
    fetchCloudSnapshot(userId),
    collectSettingsSnapshot(),
  ]);

  const merged: UserCloudSnapshot = {
    wordHuntStats: mergeGuestWordHuntStats(guestStats.wordHuntStats, cloud.wordHuntStats ?? null),
    gridSnapStats: mergeGuestGridSnapStats(guestStats.gridSnapStats, cloud.gridSnapStats ?? null),
    wordHuntSettings: mergeWordHuntSettings(settings.wordHuntSettings, cloud.wordHuntSettings ?? null),
    gridSnapSettings: mergeGridSnapSettings(settings.gridSnapSettings, cloud.gridSnapSettings ?? null),
    appSettings: mergeAppSettings(settings.appSettings, cloud.appSettings ?? null),
  };

  await upsertCloudSnapshot(userId, merged);
  await applySnapshot(merged);
  await persistUserStatsCache(userId, merged);
  await resetGuestStats();
}

export async function pushSnapshotIfSignedIn(): Promise<void> {
  const { useAuthStore } = await import('../auth/authStore');
  const userId = useAuthStore.getState().user?.id;
  if (!userId) {
    return;
  }

  await pushSnapshotForUser(userId);
}

export async function pushSnapshotForUser(userId: string): Promise<void> {
  const snapshot: UserCloudSnapshot = {
    ...collectSignedInStatsSnapshot(),
    ...collectSettingsSnapshot(),
  };

  await upsertCloudSnapshot(userId, snapshot);
  await persistUserStatsCache(userId, snapshot);
}

const SIGN_OUT_PUSH_TIMEOUT_MS = 2000;

/** Best-effort cloud push; resolves when done or after timeout (sign-out must not block on network). */
export async function pushSnapshotWithTimeout(
  userId: string,
  timeoutMs = SIGN_OUT_PUSH_TIMEOUT_MS,
): Promise<void> {
  await Promise.race([
    pushSnapshotForUser(userId),
    new Promise<void>((resolve) => {
      setTimeout(resolve, timeoutMs);
    }),
  ]);
}

export async function rehydrateLocalStores(): Promise<void> {
  await Promise.all([
    useAppSettingsStore.getState().hydrate(),
    useWordHuntSettingsStore.getState().hydrate(),
    useGridSnapSettingsStore.getState().hydrate(),
    useStatsStore.getState().hydrate(),
    useGridSnapStatsStore.getState().hydrate(),
  ]);
}
