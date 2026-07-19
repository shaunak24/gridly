import { getSupabaseClient } from '../auth/supabaseClient';
import type {
  AppSettingsCloud,
  FeedbackType,
  GridSnapSettingsCloud,
  GridSnapStatsCloud,
  UserCloudSnapshot,
  WordHuntSettingsCloud,
  WordHuntStatsCloud,
} from './types';

function mapWordHuntStats(row: Record<string, unknown>): WordHuntStatsCloud {
  return {
    gamesPlayed: Number(row.games_played ?? 0),
    gamesWon: Number(row.games_won ?? 0),
    currentStreak: Number(row.current_streak ?? 0),
    maxStreak: Number(row.max_streak ?? 0),
    distribution: Array.isArray(row.distribution) ? row.distribution.map(Number) : [0, 0, 0, 0, 0, 0, 0],
    dailyCompletedDate: (row.daily_completed_date as string | null) ?? null,
    updatedAt: String(row.updated_at ?? new Date().toISOString()),
  };
}

function mapGridSnapStats(row: Record<string, unknown>): GridSnapStatsCloud {
  return {
    gamesPlayed: Number(row.games_played ?? 0),
    gamesWon: Number(row.games_won ?? 0),
    currentStreak: Number(row.current_streak ?? 0),
    maxStreak: Number(row.max_streak ?? 0),
    dailyCompletedDate: (row.daily_completed_date as string | null) ?? null,
    updatedAt: String(row.updated_at ?? new Date().toISOString()),
  };
}

function mapWordHuntSettings(row: Record<string, unknown>): WordHuntSettingsCloud {
  return {
    hardMode: Boolean(row.hard_mode),
    notificationsEnabled: Boolean(row.notifications_enabled),
    reminderHour: Number(row.reminder_hour ?? 8),
    reminderMinute: Number(row.reminder_minute ?? 0),
    updatedAt: String(row.updated_at ?? new Date().toISOString()),
  };
}

function mapGridSnapSettings(row: Record<string, unknown>): GridSnapSettingsCloud {
  const difficulty = row.difficulty;
  return {
    difficulty:
      difficulty === 'medium' || difficulty === 'hard' || difficulty === 'easy' ? difficulty : 'easy',
    notificationsEnabled: Boolean(row.notifications_enabled),
    reminderHour: Number(row.reminder_hour ?? 8),
    reminderMinute: Number(row.reminder_minute ?? 0),
    updatedAt: String(row.updated_at ?? new Date().toISOString()),
  };
}

function mapAppSettings(row: Record<string, unknown>): AppSettingsCloud {
  const theme = row.theme;
  return {
    theme: theme === 'dark' || theme === 'light' || theme === 'system' ? theme : 'system',
    updatedAt: String(row.updated_at ?? new Date().toISOString()),
  };
}

export async function fetchCloudSnapshot(userId: string): Promise<Partial<UserCloudSnapshot>> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return {};
  }

  const [wordHuntStats, gridSnapStats, wordHuntSettings, gridSnapSettings, appSettings] =
    await Promise.all([
      supabase.from('word_hunt_stats').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('grid_snap_stats').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('word_hunt_settings').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('grid_snap_settings').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('app_settings').select('*').eq('user_id', userId).maybeSingle(),
    ]);

  const snapshot: Partial<UserCloudSnapshot> = {};

  if (wordHuntStats.data) {
    snapshot.wordHuntStats = mapWordHuntStats(wordHuntStats.data);
  }
  if (gridSnapStats.data) {
    snapshot.gridSnapStats = mapGridSnapStats(gridSnapStats.data);
  }
  if (wordHuntSettings.data) {
    snapshot.wordHuntSettings = mapWordHuntSettings(wordHuntSettings.data);
  }
  if (gridSnapSettings.data) {
    snapshot.gridSnapSettings = mapGridSnapSettings(gridSnapSettings.data);
  }
  if (appSettings.data) {
    snapshot.appSettings = mapAppSettings(appSettings.data);
  }

  return snapshot;
}

export async function upsertCloudSnapshot(userId: string, snapshot: UserCloudSnapshot): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return;
  }

  const { wordHuntStats, gridSnapStats, wordHuntSettings, gridSnapSettings, appSettings } = snapshot;

  await Promise.all([
    supabase.from('user_profiles').upsert({
      id: userId,
      updated_at: new Date().toISOString(),
    }),
    supabase.from('word_hunt_stats').upsert({
      user_id: userId,
      games_played: wordHuntStats.gamesPlayed,
      games_won: wordHuntStats.gamesWon,
      current_streak: wordHuntStats.currentStreak,
      max_streak: wordHuntStats.maxStreak,
      distribution: wordHuntStats.distribution,
      daily_completed_date: wordHuntStats.dailyCompletedDate,
      updated_at: wordHuntStats.updatedAt,
    }),
    supabase.from('grid_snap_stats').upsert({
      user_id: userId,
      games_played: gridSnapStats.gamesPlayed,
      games_won: gridSnapStats.gamesWon,
      current_streak: gridSnapStats.currentStreak,
      max_streak: gridSnapStats.maxStreak,
      daily_completed_date: gridSnapStats.dailyCompletedDate,
      updated_at: gridSnapStats.updatedAt,
    }),
    supabase.from('word_hunt_settings').upsert({
      user_id: userId,
      hard_mode: wordHuntSettings.hardMode,
      notifications_enabled: wordHuntSettings.notificationsEnabled,
      reminder_hour: wordHuntSettings.reminderHour,
      reminder_minute: wordHuntSettings.reminderMinute,
      updated_at: wordHuntSettings.updatedAt,
    }),
    supabase.from('grid_snap_settings').upsert({
      user_id: userId,
      difficulty: gridSnapSettings.difficulty,
      notifications_enabled: gridSnapSettings.notificationsEnabled,
      reminder_hour: gridSnapSettings.reminderHour,
      reminder_minute: gridSnapSettings.reminderMinute,
      updated_at: gridSnapSettings.updatedAt,
    }),
    supabase.from('app_settings').upsert({
      user_id: userId,
      theme: appSettings.theme,
      updated_at: appSettings.updatedAt,
    }),
  ]);
}

export async function submitFeedback(input: {
  userId: string | null;
  type: FeedbackType;
  message: string;
  contactEmail: string | null;
  appVersion: string;
  platform: string;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { ok: false, message: 'Cloud services are not configured yet.' };
  }

  const { error } = await supabase.from('feedback').insert({
    user_id: input.userId,
    type: input.type,
    message: input.message,
    contact_email: input.contactEmail,
    app_version: input.appVersion,
    platform: input.platform,
  });

  if (error) {
    const message = error.message.toLowerCase();
    if (message.includes('invalid') && message.includes('email')) {
      return { ok: false, message: 'Enter a valid email address.' };
    }
    if (message.includes('network') || message.includes('fetch failed')) {
      return { ok: false, message: 'Network error. Check your connection and try again.' };
    }
    return { ok: false, message: 'Could not send feedback. Please try again.' };
  }

  return { ok: true };
}
