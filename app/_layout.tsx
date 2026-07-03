import 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { useGameStore } from '../src/stores/gameStore';
import { useSettingsStore } from '../src/stores/settingsStore';
import { useStatsStore } from '../src/stores/statsStore';
import { useIsDarkTheme } from '../src/theme/useTheme';

export default function RootLayout() {
  const hydrateSettings = useSettingsStore((s) => s.hydrate);
  const hydrateStats = useStatsStore((s) => s.hydrate);
  const hydrateProgress = useGameStore((s) => s.hydrateProgress);
  const isDark = useIsDarkTheme();

  useEffect(() => {
    void hydrateSettings();
    void hydrateStats();
    void hydrateProgress();
  }, [hydrateSettings, hydrateStats, hydrateProgress]);

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />
    </>
  );
}
