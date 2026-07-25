import type { GridSnapStatsByMode } from '../../shared/stats/gridSnapModeStats';
import type { WordHuntStatsByMode } from '../../shared/stats/wordHuntModeStats';
import type { SnapDifficulty } from '../../games/grid-snap/core/types';
import type { ThemePreference } from '../../shared/theme/colors';

export interface Timestamped {
  updatedAt: string;
}

export interface WordHuntStatsCloud extends Timestamped {
  dailyCompletedDate: string | null;
  statsByMode: WordHuntStatsByMode;
}

export interface GridSnapStatsCloud extends Timestamped {
  dailyCompletedDate: string | null;
  statsByMode: GridSnapStatsByMode;
}

export interface WordHuntSettingsCloud extends Timestamped {
  hardMode: boolean;
  notificationsEnabled: boolean;
  reminderHour: number;
  reminderMinute: number;
}

export interface GridSnapSettingsCloud extends Timestamped {
  difficulty: SnapDifficulty;
  notificationsEnabled: boolean;
  reminderHour: number;
  reminderMinute: number;
}

export interface AppSettingsCloud extends Timestamped {
  theme: ThemePreference;
}

export interface UserCloudSnapshot {
  wordHuntStats: WordHuntStatsCloud;
  gridSnapStats: GridSnapStatsCloud;
  wordHuntSettings: WordHuntSettingsCloud;
  gridSnapSettings: GridSnapSettingsCloud;
  appSettings: AppSettingsCloud;
}

export type FeedbackType = 'feedback' | 'bug';
