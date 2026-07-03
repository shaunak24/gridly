import { Ionicons } from '@expo/vector-icons';
import { useCallback } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { useSettingsStore } from '../stores/settingsStore';
import { useIsDarkTheme, useTheme } from '../theme/useTheme';

export function ThemeToggleButton() {
  const theme = useTheme();
  const isDark = useIsDarkTheme();
  const setTheme = useSettingsStore((s) => s.setTheme);

  const toggleTheme = useCallback(() => {
    void setTheme(isDark ? 'light' : 'dark');
  }, [isDark, setTheme]);

  return (
    <Pressable
      onPress={toggleTheme}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: theme.card, borderColor: theme.border },
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      <Ionicons
        name={isDark ? 'bulb-outline' : 'bulb'}
        size={22}
        color={isDark ? theme.amber : theme.textPrimary}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.85 },
});
