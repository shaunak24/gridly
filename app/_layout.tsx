import 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useAuthStore } from '../src/platform/auth/authStore';
import { useWelcomeStore } from '../src/platform/auth/welcomeStore';
import { useColorFlowSettingsStore } from '../src/games/color-flow/stores/colorFlowSettingsStore';
import { useColorFlowStatsStore } from '../src/games/color-flow/stores/colorFlowStatsStore';
import { useColorFlowStore } from '../src/games/color-flow/stores/colorFlowStore';
import { useGridSnapStatsStore } from '../src/games/grid-snap/stores/gridSnapStatsStore';
import { useGridSnapSettingsStore } from '../src/games/grid-snap/stores/gridSnapSettingsStore';
import { useGridSnapStore } from '../src/games/grid-snap/stores/gridSnapStore';
import { useGameStore } from '../src/games/word-hunt/stores/gameStore';
import { useWordHuntSettingsStore } from '../src/games/word-hunt/stores/wordHuntSettingsStore';
import { useStatsStore } from '../src/games/word-hunt/stores/statsStore';
import { useAppSettingsStore } from '../src/shared/stores/appSettingsStore';
import { AppMessageHost } from '../src/shared/components/AppMessageHost';
import { useIsDarkTheme } from '../src/shared/theme/useTheme';

export default function RootLayout() {
  const initAuth = useAuthStore((s) => s.init);
  const hydrateWelcome = useWelcomeStore((s) => s.hydrate);
  const hydrateAppSettings = useAppSettingsStore((s) => s.hydrate);
  const hydrateWordHuntSettings = useWordHuntSettingsStore((s) => s.hydrate);
  const hydrateStats = useStatsStore((s) => s.hydrate);
  const hydrateProgress = useGameStore((s) => s.hydrateProgress);
  const hydrateGridSnapSettings = useGridSnapSettingsStore((s) => s.hydrate);
  const hydrateGridSnapStats = useGridSnapStatsStore((s) => s.hydrate);
  const hydrateColorFlowSettings = useColorFlowSettingsStore((s) => s.hydrate);
  const hydrateColorFlowStats = useColorFlowStatsStore((s) => s.hydrate);
  const hydrateColorFlowProgress = useColorFlowStore((s) => s.hydrateProgress);
  const hydrateGridSnapProgress = useGridSnapStore((s) => s.hydrateProgress);
  const isDark = useIsDarkTheme();

  useEffect(() => {
    void initAuth();
    void hydrateWelcome();
    void hydrateAppSettings();
    void hydrateWordHuntSettings();
    void hydrateStats();
    void hydrateProgress();
    void hydrateGridSnapSettings();
    void hydrateGridSnapStats();
    void hydrateGridSnapProgress();
    void hydrateColorFlowSettings();
    void hydrateColorFlowStats();
    void hydrateColorFlowProgress();
  }, [
    initAuth,
    hydrateWelcome,
    hydrateAppSettings,
    hydrateWordHuntSettings,
    hydrateStats,
    hydrateProgress,
    hydrateGridSnapSettings,
    hydrateGridSnapStats,
    hydrateGridSnapProgress,
    hydrateColorFlowSettings,
    hydrateColorFlowStats,
    hydrateColorFlowProgress,
  ]);

  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <AppMessageHost />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
