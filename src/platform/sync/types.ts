import type { ColorFlowStatsByMode } from '../../shared/stats/colorFlowModeStats';
import type { GridSnapStatsByMode } from '../../shared/stats/gridSnapModeStats';
import type { WordHuntStatsByMode } from '../../shared/stats/wordHuntModeStats';
import type { FlowDifficulty } from '../../games/color-flow/core/types';
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

export interface ColorFlowStatsCloud extends Timestamped {
  dailyCompletedDate: string | null;
  statsByMode: ColorFlowStatsByMode;
}

export interface ColorFlowSettingsCloud extends Timestamped {
  difficulty: FlowDifficulty;
  notificationsEnabled: boolean;
  reminderHour: number;
  reminderMinute: number;
}

export interface UserCloudSnapshot {
  wordHuntStats: WordHuntStatsCloud;
  gridSnapStats: GridSnapStatsCloud;
  colorFlowStats: ColorFlowStatsCloud;
  wordHuntSettings: WordHuntSettingsCloud;
  gridSnapSettings: GridSnapSettingsCloud;
  colorFlowSettings: ColorFlowSettingsCloud;
  appSettings: AppSettingsCloud;
}

export type FeedbackType = 'feedback' | 'bug';
