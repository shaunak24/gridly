import { useColorScheme } from 'react-native';

import { useSettingsStore } from '../stores/settingsStore';
import { darkTheme, lightTheme, type ThemeColors } from './colors';

export function useTheme(): ThemeColors {
  const preference = useSettingsStore((s) => s.theme);
  const systemScheme = useColorScheme();

  if (preference === 'light') {
    return lightTheme;
  }
  if (preference === 'dark') {
    return darkTheme;
  }

  return systemScheme === 'light' ? lightTheme : darkTheme;
}

export function useIsDarkTheme(): boolean {
  const preference = useSettingsStore((s) => s.theme);
  const systemScheme = useColorScheme();

  if (preference === 'light') {
    return false;
  }
  if (preference === 'dark') {
    return true;
  }

  return systemScheme !== 'light';
}
