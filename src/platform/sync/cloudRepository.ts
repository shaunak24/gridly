import { getSupabaseClient } from '../auth/supabaseClient';
import { GAME_REMINDER_DEFAULTS } from '../../services/notifications';
import type {
  AppSettingsCloud,
  ColorFlowSettingsCloud,
  ColorFlowStatsCloud,
  FeedbackType,
  GridSnapSettingsCloud,
  GridSnapStatsCloud,
  UserCloudSnapshot,
  WordHuntSettingsCloud,
  WordHuntStatsCloud,
} from './types';
import { emptyColorFlowStatsByMode } from '../../shared/stats/colorFlowModeStats';
import { emptyGridSnapStatsByMode } from '../../shared/stats/gridSnapModeStats';
import { emptyWordHuntStatsByMode } from '../../shared/stats/wordHuntModeStats';

function mapWordHuntStats(row: Record<string, unknown>): WordHuntStatsCloud {
  const statsByModeRaw = row.stats_by_mode;
  const statsByMode =
    statsByModeRaw && typeof statsByModeRaw === 'object'
      ? (statsByModeRaw as WordHuntStatsCloud['statsByMode'])
      : emptyWordHuntStatsByMode();

  return {
    statsByMode,
    dailyCompletedDate: (row.daily_completed_date as string | null) ?? null,
    updatedAt: String(row.updated_at ?? new Date().toISOString()),
  };
}

function mapGridSnapStats(row: Record<string, unknown>): GridSnapStatsCloud {
  const statsByModeRaw = row.stats_by_mode;
  const statsByMode =
    statsByModeRaw && typeof statsByModeRaw === 'object'
      ? (statsByModeRaw as GridSnapStatsCloud['statsByMode'])
      : emptyGridSnapStatsByMode();

  return {
    statsByMode,
    dailyCompletedDate: (row.daily_completed_date as string | null) ?? null,
    updatedAt: String(row.updated_at ?? new Date().toISOString()),
  };
}

function mapColorFlowStats(row: Record<string, unknown>): ColorFlowStatsCloud {
  const statsByModeRaw = row.stats_by_mode;
  const statsByMode =
    statsByModeRaw && typeof statsByModeRaw === 'object'
      ? (statsByModeRaw as ColorFlowStatsCloud['statsByMode'])
      : emptyColorFlowStatsByMode();

  return {
    statsByMode,
    dailyCompletedDate: (row.daily_completed_date as string | null) ?? null,
    updatedAt: String(row.updated_at ?? new Date().toISOString()),
  };
}

function mapWordHuntSettings(row: Record<string, unknown>): WordHuntSettingsCloud {
  const defaults = GAME_REMINDER_DEFAULTS['word-hunt'];
  return {
    hardMode: Boolean(row.hard_mode),
    notificationsEnabled: row.notifications_enabled !== false,
    reminderHour: Number(row.reminder_hour ?? defaults.hour),
    reminderMinute: Number(row.reminder_minute ?? defaults.minute),
    updatedAt: String(row.updated_at ?? new Date().toISOString()),
  };
}

function mapGridSnapSettings(row: Record<string, unknown>): GridSnapSettingsCloud {
  const difficulty = row.difficulty;
  const defaults = GAME_REMINDER_DEFAULTS['grid-snap'];
  return {
    difficulty:
      difficulty === 'medium' || difficulty === 'hard' || difficulty === 'easy' ? difficulty : 'easy',
    notificationsEnabled: row.notifications_enabled !== false,
    reminderHour: Number(row.reminder_hour ?? defaults.hour),
    reminderMinute: Number(row.reminder_minute ?? defaults.minute),
    updatedAt: String(row.updated_at ?? new Date().toISOString()),
  };
}

function mapColorFlowSettings(row: Record<string, unknown>): ColorFlowSettingsCloud {
  const difficulty = row.difficulty;
  const defaults = GAME_REMINDER_DEFAULTS['color-flow'];
  return {
    difficulty:
      difficulty === 'medium' || difficulty === 'hard' || difficulty === 'easy' ? difficulty : 'easy',
    notificationsEnabled: row.notifications_enabled !== false,
    reminderHour: Number(row.reminder_hour ?? defaults.hour),
    reminderMinute: Number(row.reminder_minute ?? defaults.minute),
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

  const [
    wordHuntStats,
    gridSnapStats,
    colorFlowStats,
    wordHuntSettings,
    gridSnapSettings,
    colorFlowSettings,
    appSettings,
  ] = await Promise.all([
    supabase.from('word_hunt_stats').select('*').eq('user_id', userId).maybeSingle(),
    supabase.from('grid_snap_stats').select('*').eq('user_id', userId).maybeSingle(),
    supabase.from('color_flow_stats').select('*').eq('user_id', userId).maybeSingle(),
    supabase.from('word_hunt_settings').select('*').eq('user_id', userId).maybeSingle(),
    supabase.from('grid_snap_settings').select('*').eq('user_id', userId).maybeSingle(),
    supabase.from('color_flow_settings').select('*').eq('user_id', userId).maybeSingle(),
    supabase.from('app_settings').select('*').eq('user_id', userId).maybeSingle(),
  ]);

  const snapshot: Partial<UserCloudSnapshot> = {};

  if (wordHuntStats.data) {
    snapshot.wordHuntStats = mapWordHuntStats(wordHuntStats.data);
  }
  if (gridSnapStats.data) {
    snapshot.gridSnapStats = mapGridSnapStats(gridSnapStats.data);
  }
  if (colorFlowStats.data) {
    snapshot.colorFlowStats = mapColorFlowStats(colorFlowStats.data);
  }
  if (wordHuntSettings.data) {
    snapshot.wordHuntSettings = mapWordHuntSettings(wordHuntSettings.data);
  }
  if (gridSnapSettings.data) {
    snapshot.gridSnapSettings = mapGridSnapSettings(gridSnapSettings.data);
  }
  if (colorFlowSettings.data) {
    snapshot.colorFlowSettings = mapColorFlowSettings(colorFlowSettings.data);
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

  const {
    wordHuntStats,
    gridSnapStats,
    colorFlowStats,
    wordHuntSettings,
    gridSnapSettings,
    colorFlowSettings,
    appSettings,
  } = snapshot;

  await Promise.all([
    supabase.from('user_profiles').upsert({
      id: userId,
      updated_at: new Date().toISOString(),
    }),
    supabase.from('word_hunt_stats').upsert({
      user_id: userId,
      stats_by_mode: wordHuntStats.statsByMode,
      daily_completed_date: wordHuntStats.dailyCompletedDate,
      updated_at: wordHuntStats.updatedAt,
    }),
    supabase.from('grid_snap_stats').upsert({
      user_id: userId,
      stats_by_mode: gridSnapStats.statsByMode,
      daily_completed_date: gridSnapStats.dailyCompletedDate,
      updated_at: gridSnapStats.updatedAt,
    }),
    supabase.from('color_flow_stats').upsert({
      user_id: userId,
      stats_by_mode: colorFlowStats.statsByMode,
      daily_completed_date: colorFlowStats.dailyCompletedDate,
      updated_at: colorFlowStats.updatedAt,
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
    supabase.from('color_flow_settings').upsert({
      user_id: userId,
      difficulty: colorFlowSettings.difficulty,
      notifications_enabled: colorFlowSettings.notificationsEnabled,
      reminder_hour: colorFlowSettings.reminderHour,
      reminder_minute: colorFlowSettings.reminderMinute,
      updated_at: colorFlowSettings.updatedAt,
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
