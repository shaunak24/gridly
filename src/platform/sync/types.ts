import type { GridSnapStatsData } from '../../games/grid-snap/stores/gridSnapStatsStore';
import type { SnapDifficulty } from '../../games/grid-snap/core/types';
import type { StatsData } from '../../games/word-hunt/stores/statsStore';
import type { ThemePreference } from '../../shared/theme/colors';

export interface Timestamped {
  updatedAt: string;
}

export interface WordHuntStatsCloud extends StatsData, Timestamped {
  dailyCompletedDate: string | null;
}

export interface GridSnapStatsCloud extends GridSnapStatsData, Timestamped {
  dailyCompletedDate: string | null;
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
