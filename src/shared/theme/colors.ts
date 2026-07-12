export type GameMode = 'daily' | 'practice';

export type ThemePreference = 'dark' | 'light' | 'system';

export interface ThemeColors {
  teal: string;
  amber: string;
  slate: string;
  background: string;
  tileEmpty: string;
  coral: string;
  textPrimary: string;
  textSecondary: string;
  keyDefault: string;
  keyText: string;
  danger: string;
  border: string;
  card: string;
}

export const darkTheme: ThemeColors = {
  teal: '#14B8A6',
  amber: '#F59E0B',
  slate: '#64748B',
  background: '#1E1B2E',
  tileEmpty: '#2D2A40',
  coral: '#F97316',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  keyDefault: '#3D3854',
  keyText: '#F8FAFC',
  danger: '#EF4444',
  border: '#3D3854',
  card: '#2D2A40',
};

export const lightTheme: ThemeColors = {
  teal: '#0D9488',
  amber: '#D97706',
  slate: '#64748B',
  background: '#F1F5F9',
  tileEmpty: '#E2E8F0',
  coral: '#EA580C',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  keyDefault: '#CBD5E1',
  keyText: '#0F172A',
  danger: '#DC2626',
  border: '#CBD5E1',
  card: '#FFFFFF',
};

/** @deprecated Use useTheme() — kept for gradual migration */
export const colors = darkTheme;
