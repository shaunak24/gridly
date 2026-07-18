import { useGridSnapSettingsStore } from '../../games/grid-snap/stores/gridSnapSettingsStore';
import { useGridSnapStatsStore } from '../../games/grid-snap/stores/gridSnapStatsStore';
import { useWordHuntSettingsStore } from '../../games/word-hunt/stores/wordHuntSettingsStore';
import { useStatsStore } from '../../games/word-hunt/stores/statsStore';
import { scheduleGameReminder } from '../../services/notifications';
import { useAppSettingsStore } from '../../shared/stores/appSettingsStore';
import { fetchCloudSnapshot, upsertCloudSnapshot } from './cloudRepository';
import {
  mergeAppSettings,
  mergeGridSnapSettings,
  mergeGridSnapStats,
  mergeWordHuntSettings,
  mergeWordHuntStats,
  nowIso,
  toGridSnapStatsCloud,
  toWordHuntStatsCloud,
} from './mergePolicy';
import type { UserCloudSnapshot } from './types';

function collectLocalSnapshot(): UserCloudSnapshot {
  const wordHuntStatsState = useStatsStore.getState();
  const gridSnapStatsState = useGridSnapStatsStore.getState();
  const wordHuntSettingsState = useWordHuntSettingsStore.getState();
  const gridSnapSettingsState = useGridSnapSettingsStore.getState();
  const appSettingsState = useAppSettingsStore.getState();
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

export async function mergeLocalToCloud(userId: string): Promise<void> {
  const local = collectLocalSnapshot();
  const cloud = await fetchCloudSnapshot(userId);

  const merged: UserCloudSnapshot = {
    wordHuntStats: mergeWordHuntStats(local.wordHuntStats, cloud.wordHuntStats ?? null),
    gridSnapStats: mergeGridSnapStats(local.gridSnapStats, cloud.gridSnapStats ?? null),
    wordHuntSettings: mergeWordHuntSettings(local.wordHuntSettings, cloud.wordHuntSettings ?? null),
    gridSnapSettings: mergeGridSnapSettings(local.gridSnapSettings, cloud.gridSnapSettings ?? null),
    appSettings: mergeAppSettings(local.appSettings, cloud.appSettings ?? null),
  };

  await upsertCloudSnapshot(userId, merged);
  await applySnapshot(merged);
}

export async function pushIfSignedIn(): Promise<void> {
  const { useAuthStore } = await import('../auth/authStore');
  const userId = useAuthStore.getState().user?.id;
  if (!userId) {
    return;
  }

  const snapshot = collectLocalSnapshot();
  await upsertCloudSnapshot(userId, snapshot);
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
