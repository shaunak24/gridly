import { useColorFlowSettingsStore } from '../../games/color-flow/stores/colorFlowSettingsStore';
import { useColorFlowCampaignStore } from '../../games/color-flow/stores/colorFlowCampaignStore';
import { useColorFlowStatsStore } from '../../games/color-flow/stores/colorFlowStatsStore';
import { useGridSnapSettingsStore } from '../../games/grid-snap/stores/gridSnapSettingsStore';
import { useGridSnapStatsStore } from '../../games/grid-snap/stores/gridSnapStatsStore';
import { useWordHuntSettingsStore } from '../../games/word-hunt/stores/wordHuntSettingsStore';
import { useStatsStore } from '../../games/word-hunt/stores/statsStore';
import { scheduleGameReminder } from '../../services/notifications';
import { useAppSettingsStore } from '../../shared/stores/appSettingsStore';
import { loadDailyCompletedDate, loadGuestDailyCompletedDate, saveDailyCompletedDate } from './dailyCompletion';
import { fetchCloudSnapshot, upsertCloudSnapshot } from './cloudRepository';
import {
  mergeAppSettings,
  mergeColorFlowSettings,
  mergeGridSnapSettings,
  mergeGuestColorFlowStats,
  mergeGuestGridSnapStats,
  mergeGuestWordHuntStats,
  mergeWordHuntSettings,
  nowIso,
  pickNewerColorFlowStats,
  pickNewerGridSnapStats,
  pickNewerWordHuntStats,
  toColorFlowStatsCloud,
  toGridSnapStatsCloud,
  toWordHuntStatsCloud,
} from './mergePolicy';
import { emptyColorFlowStoredStats } from '../../shared/stats/colorFlowModeStats';
import { emptyGridSnapStoredStats } from '../../shared/stats/gridSnapModeStats';
import { emptyWordHuntStatsByMode } from '../../shared/stats/wordHuntModeStats';
import {
  loadGuestColorFlowStats,
  loadGuestGridSnapStats,
  loadGuestWordHuntStats,
  loadUserColorFlowStats,
  loadUserGridSnapStats,
  loadUserWordHuntStats,
  resetGuestStats,
  saveUserColorFlowStats,
  saveUserGridSnapStats,
  saveUserWordHuntStats,
  hasGuestStatsProgress,
} from './statsStorage';
import type { ColorFlowStatsCloud, GridSnapStatsCloud, UserCloudSnapshot, WordHuntStatsCloud } from './types';

function collectSettingsSnapshot(): Pick<
  UserCloudSnapshot,
  'wordHuntSettings' | 'gridSnapSettings' | 'colorFlowSettings' | 'appSettings'
> {
  const wordHuntSettingsState = useWordHuntSettingsStore.getState();
  const gridSnapSettingsState = useGridSnapSettingsStore.getState();
  const colorFlowSettingsState = useColorFlowSettingsStore.getState();
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
    colorFlowSettings: {
      difficulty: colorFlowSettingsState.difficulty,
      notificationsEnabled: colorFlowSettingsState.notificationsEnabled,
      reminderHour: colorFlowSettingsState.reminderHour,
      reminderMinute: colorFlowSettingsState.reminderMinute,
      updatedAt: timestamp,
    },
    appSettings: {
      theme: appSettingsState.theme,
      musicEnabled: appSettingsState.musicEnabled,
      updatedAt: timestamp,
    },
  };
}

function collectSignedInStatsSnapshot(): Pick<
  UserCloudSnapshot,
  'wordHuntStats' | 'gridSnapStats' | 'colorFlowStats'
> {
  const wordHuntStatsState = useStatsStore.getState();
  const gridSnapStatsState = useGridSnapStatsStore.getState();
  const colorFlowStatsState = useColorFlowStatsStore.getState();
  const timestamp = nowIso();

  return {
    wordHuntStats: toWordHuntStatsCloud(
      wordHuntStatsState.byMode,
      wordHuntStatsState.dailyCompletedDate,
      timestamp,
    ),
    gridSnapStats: toGridSnapStatsCloud(
      { daily: gridSnapStatsState.daily, byMode: gridSnapStatsState.byMode },
      gridSnapStatsState.dailyCompletedDate,
      timestamp,
    ),
    colorFlowStats: toColorFlowStatsCloud(
      {
        daily: colorFlowStatsState.daily,
        byMode: colorFlowStatsState.byMode,
        campaign: colorFlowStatsState.campaign,
      },
      colorFlowStatsState.dailyCompletedDate,
      timestamp,
    ),
  };
}

async function loadGuestStatsSnapshot(): Promise<
  Pick<UserCloudSnapshot, 'wordHuntStats' | 'gridSnapStats' | 'colorFlowStats'>
> {
  const [wordHuntStats, gridSnapStats, colorFlowStats, wordHuntDaily, gridSnapDaily, colorFlowDaily] =
    await Promise.all([
      loadGuestWordHuntStats(),
      loadGuestGridSnapStats(),
      loadGuestColorFlowStats(),
      loadGuestDailyCompletedDate('word-hunt'),
      loadGuestDailyCompletedDate('grid-snap'),
      loadGuestDailyCompletedDate('color-flow'),
    ]);
  const timestamp = nowIso();

  return {
    wordHuntStats: toWordHuntStatsCloud(
      wordHuntStats?.byMode ?? emptyWordHuntStatsByMode(),
      wordHuntDaily,
      timestamp,
    ),
    gridSnapStats: toGridSnapStatsCloud(gridSnapStats ?? emptyGridSnapStoredStats(), gridSnapDaily, timestamp),
    colorFlowStats: toColorFlowStatsCloud(
      colorFlowStats ?? emptyColorFlowStoredStats(),
      colorFlowDaily,
      timestamp,
    ),
  };
}

async function loadUserStatsSnapshot(
  userId: string,
): Promise<{
  wordHunt: WordHuntStatsCloud | null;
  gridSnap: GridSnapStatsCloud | null;
  colorFlow: ColorFlowStatsCloud | null;
}> {
  const [wordHuntStats, gridSnapStats, colorFlowStats] = await Promise.all([
    loadUserWordHuntStats(userId),
    loadUserGridSnapStats(userId),
    loadUserColorFlowStats(userId),
  ]);

  return {
    wordHunt: wordHuntStats
      ? toWordHuntStatsCloud(wordHuntStats.byMode, null, wordHuntStats.updatedAt)
      : null,
    gridSnap: gridSnapStats
      ? toGridSnapStatsCloud(
          { daily: gridSnapStats.daily, byMode: gridSnapStats.byMode },
          null,
          gridSnapStats.updatedAt,
        )
      : null,
    colorFlow: colorFlowStats
      ? toColorFlowStatsCloud(
          {
            daily: colorFlowStats.daily,
            byMode: colorFlowStats.byMode,
            campaign: colorFlowStats.campaign,
          },
          null,
          colorFlowStats.updatedAt,
        )
      : null,
  };
}

async function persistUserStatsCache(
  userId: string,
  snapshot: Pick<UserCloudSnapshot, 'wordHuntStats' | 'gridSnapStats' | 'colorFlowStats'>,
): Promise<void> {
  await Promise.all([
    saveUserWordHuntStats(userId, { byMode: snapshot.wordHuntStats.statsByMode }, snapshot.wordHuntStats.updatedAt),
    saveUserGridSnapStats(userId, snapshot.gridSnapStats.statsByMode, snapshot.gridSnapStats.updatedAt),
    saveUserColorFlowStats(
      userId,
      snapshot.colorFlowStats.statsByMode,
      snapshot.colorFlowStats.updatedAt,
    ),
  ]);
}

async function applySnapshot(snapshot: UserCloudSnapshot): Promise<void> {
  const {
    wordHuntStats,
    gridSnapStats,
    colorFlowStats,
    wordHuntSettings,
    gridSnapSettings,
    colorFlowSettings,
    appSettings,
  } = snapshot;

  useStatsStore.setState({
    byMode: wordHuntStats.statsByMode,
    dailyCompletedDate: wordHuntStats.dailyCompletedDate,
    hydrated: true,
  });

  useGridSnapStatsStore.setState({
    daily: gridSnapStats.statsByMode.daily,
    byMode: gridSnapStats.statsByMode.byMode,
    dailyCompletedDate: gridSnapStats.dailyCompletedDate,
    hydrated: true,
  });

  useColorFlowStatsStore.setState({
    daily: colorFlowStats.statsByMode.daily,
    byMode: colorFlowStats.statsByMode.byMode,
    campaign: colorFlowStats.statsByMode.campaign ?? emptyColorFlowStoredStats().campaign!,
    dailyCompletedDate: colorFlowStats.dailyCompletedDate,
    hydrated: true,
  });

  useColorFlowCampaignStore.setState({
    progress: useColorFlowStatsStore.getState().getCampaignProgress(),
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

  useColorFlowSettingsStore.setState({
    difficulty: colorFlowSettings.difficulty,
    notificationsEnabled: colorFlowSettings.notificationsEnabled,
    reminderHour: colorFlowSettings.reminderHour,
    reminderMinute: colorFlowSettings.reminderMinute,
    hydrated: true,
  });

  useAppSettingsStore.setState({
    theme: appSettings.theme,
    musicEnabled: appSettings.musicEnabled,
    hydrated: true,
  });

  await Promise.all([
    useStatsStore.getState().persist?.(),
    useGridSnapStatsStore.getState().persist?.(),
    useColorFlowStatsStore.getState().persist?.(),
    useWordHuntSettingsStore.getState().persist?.(),
    useGridSnapSettingsStore.getState().persist?.(),
    useColorFlowSettingsStore.getState().persist?.(),
    useAppSettingsStore.getState().persist?.(),
    wordHuntStats.dailyCompletedDate
      ? saveDailyCompletedDate('word-hunt', wordHuntStats.dailyCompletedDate)
      : Promise.resolve(),
    gridSnapStats.dailyCompletedDate
      ? saveDailyCompletedDate('grid-snap', gridSnapStats.dailyCompletedDate)
      : Promise.resolve(),
    colorFlowStats.dailyCompletedDate
      ? saveDailyCompletedDate('color-flow', colorFlowStats.dailyCompletedDate)
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
    scheduleGameReminder(
      'color-flow',
      colorFlowSettings.notificationsEnabled,
      colorFlowSettings.reminderHour,
      colorFlowSettings.reminderMinute,
    ),
  ]);
}

export async function loadSignedInUserStores(userId: string): Promise<void> {
  const [cloud, localUser, settings, userWordHuntDaily, userGridSnapDaily, userColorFlowDaily] =
    await Promise.all([
      fetchCloudSnapshot(userId),
      loadUserStatsSnapshot(userId),
      collectSettingsSnapshot(),
      loadDailyCompletedDate('word-hunt'),
      loadDailyCompletedDate('grid-snap'),
      loadDailyCompletedDate('color-flow'),
    ]);

  const wordHuntStats = pickNewerWordHuntStats(localUser.wordHunt, cloud.wordHuntStats ?? null);
  const gridSnapStats = pickNewerGridSnapStats(localUser.gridSnap, cloud.gridSnapStats ?? null);
  const colorFlowStats = pickNewerColorFlowStats(localUser.colorFlow, cloud.colorFlowStats ?? null);

  wordHuntStats.dailyCompletedDate =
    cloud.wordHuntStats?.dailyCompletedDate ?? userWordHuntDaily ?? null;
  gridSnapStats.dailyCompletedDate =
    cloud.gridSnapStats?.dailyCompletedDate ?? userGridSnapDaily ?? null;
  colorFlowStats.dailyCompletedDate =
    cloud.colorFlowStats?.dailyCompletedDate ?? userColorFlowDaily ?? null;

  const snapshot: UserCloudSnapshot = {
    wordHuntStats,
    gridSnapStats,
    colorFlowStats,
    wordHuntSettings: mergeWordHuntSettings(settings.wordHuntSettings, cloud.wordHuntSettings ?? null),
    gridSnapSettings: mergeGridSnapSettings(settings.gridSnapSettings, cloud.gridSnapSettings ?? null),
    colorFlowSettings: mergeColorFlowSettings(settings.colorFlowSettings, cloud.colorFlowSettings ?? null),
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
    colorFlowStats: mergeGuestColorFlowStats(guestStats.colorFlowStats, cloud.colorFlowStats ?? null),
    wordHuntSettings: mergeWordHuntSettings(settings.wordHuntSettings, cloud.wordHuntSettings ?? null),
    gridSnapSettings: mergeGridSnapSettings(settings.gridSnapSettings, cloud.gridSnapSettings ?? null),
    colorFlowSettings: mergeColorFlowSettings(settings.colorFlowSettings, cloud.colorFlowSettings ?? null),
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

  await Promise.all([
    snapshot.wordHuntStats.dailyCompletedDate
      ? saveDailyCompletedDate('word-hunt', snapshot.wordHuntStats.dailyCompletedDate)
      : Promise.resolve(),
    snapshot.gridSnapStats.dailyCompletedDate
      ? saveDailyCompletedDate('grid-snap', snapshot.gridSnapStats.dailyCompletedDate)
      : Promise.resolve(),
    snapshot.colorFlowStats.dailyCompletedDate
      ? saveDailyCompletedDate('color-flow', snapshot.colorFlowStats.dailyCompletedDate)
      : Promise.resolve(),
  ]);
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
  const { useColorFlowCampaignStore } = await import('../../games/color-flow/stores/colorFlowCampaignStore');

  await Promise.all([
    useAppSettingsStore.getState().hydrate(),
    useWordHuntSettingsStore.getState().hydrate(),
    useGridSnapSettingsStore.getState().hydrate(),
    useColorFlowSettingsStore.getState().hydrate(),
    useStatsStore.getState().hydrate(),
    useGridSnapStatsStore.getState().hydrate(),
    useColorFlowStatsStore.getState().hydrate(),
  ]);

  useColorFlowCampaignStore.setState({
    progress: useColorFlowStatsStore.getState().getCampaignProgress(),
    hydrated: true,
  });
}

let lastPostSignInUserId: string | null = null;

export function resetPostSignInState(): void {
  lastPostSignInUserId = null;
}

export function markPostSignInComplete(userId: string): void {
  lastPostSignInUserId = userId;
}

/** Load cloud/local account stats on sign-in; merge guest progress only when guest has played. */
export async function handlePostSignIn(userId: string): Promise<void> {
  if (lastPostSignInUserId === userId) {
    return;
  }

  if (await hasGuestStatsProgress()) {
    await mergeLocalToCloud(userId);
  } else {
    await loadSignedInUserStores(userId);
  }

  lastPostSignInUserId = userId;
}
