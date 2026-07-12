import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { formatDailyCountdownTimer } from '../../../src/games/word-hunt/hooks/dailyCountdownUtil';
import { useDailyCountdown } from '../../../src/games/word-hunt/hooks/useDailyCountdown';
import { useGridSnapStatsStore } from '../../../src/games/grid-snap/stores/gridSnapStatsStore';
import { useGridSnapStore } from '../../../src/games/grid-snap/stores/gridSnapStore';
import { HeaderBackButton } from '../../../src/shared/components/HeaderBackButton';
import { HeaderIconButton } from '../../../src/shared/components/HeaderIconButton';
import { useTheme } from '../../../src/shared/theme/useTheme';

export default function GridSnapHubScreen() {
  const router = useRouter();
  const theme = useTheme();
  const dailyDone = useGridSnapStatsStore((s) => s.isDailyCompleteToday());
  const gamesPlayed = useGridSnapStatsStore((s) => s.gamesPlayed);
  const currentStreak = useGridSnapStatsStore((s) => s.currentStreak);
  const dailyInProgress = useGridSnapStore((s) => s.dailyInProgress);
  const practiceInProgress = useGridSnapStore((s) => s.practiceInProgress);
  const remainingMs = useDailyCountdown(dailyDone);

  const dailyLabel = dailyDone
    ? "Today's puzzle complete"
    : dailyInProgress
      ? 'Continue daily'
      : 'Play daily';

  const practiceLabel = practiceInProgress ? 'Continue practice' : 'Practice';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.topBar}>
        <HeaderBackButton onPress={() => router.replace('/')} />
        <Text style={[styles.gameTitle, { color: theme.textPrimary }]}>Grid Snap</Text>
        <HeaderIconButton
          name="settings-outline"
          onPress={() => router.push('/games/grid-snap/settings')}
          accessibilityLabel="Grid Snap settings"
        />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.content}>
          <Text style={[styles.tagline, { color: theme.textSecondary }]}>Connect the pieces.</Text>
          {gamesPlayed > 0 ? (
            <Text style={[styles.streak, { color: theme.coral }]}>
              Streak: {currentStreak} · Played: {gamesPlayed}
            </Text>
          ) : null}
        </View>

        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              { backgroundColor: theme.coral },
              dailyDone && styles.primaryButtonDone,
              dailyDone && styles.disabledButton,
              pressed && !dailyDone && styles.pressed,
            ]}
            onPress={() => router.push({ pathname: '/games/grid-snap/play', params: { mode: 'daily' } })}
            disabled={dailyDone}
          >
            <Text style={[styles.primaryText, { color: theme.textPrimary }]}>{dailyLabel}</Text>
            {dailyDone ? (
              <Text style={[styles.countdownText, { color: theme.textPrimary }]}>
                {formatDailyCountdownTimer(remainingMs)}
              </Text>
            ) : null}
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.secondaryButton,
              { backgroundColor: theme.card, borderColor: theme.border },
              pressed && styles.pressed,
            ]}
            onPress={() => router.push({ pathname: '/games/grid-snap/play', params: { mode: 'practice' } })}
          >
            <Text style={[styles.secondaryText, { color: theme.textPrimary }]}>{practiceLabel}</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.linkButton, pressed && styles.pressed]}
            onPress={() => router.push('/games/grid-snap/stats')}
          >
            <Text style={[styles.linkText, { color: theme.textSecondary }]}>Stats</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.linkButton, pressed && styles.pressed]}
            onPress={() => router.push('/games/grid-snap/how-to-play')}
          >
            <Text style={[styles.linkText, { color: theme.textSecondary }]}>How to play</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 8,
    gap: 8,
  },
  gameTitle: { fontSize: 18, fontWeight: '700', flex: 1, textAlign: 'center' },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
    justifyContent: 'center',
  },
  content: { alignItems: 'center', gap: 12 },
  tagline: { fontSize: 16, textAlign: 'center' },
  streak: { fontSize: 14, fontWeight: '600' },
  actions: { gap: 10, marginTop: 32 },
  primaryButton: {
    borderRadius: 10,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonDone: {
    position: 'relative',
    minHeight: 56,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  disabledButton: { opacity: 0.55 },
  primaryText: { fontSize: 18, fontWeight: '700' },
  countdownText: {
    position: 'absolute',
    right: 12,
    bottom: 6,
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    opacity: 0.9,
  },
  secondaryButton: {
    borderRadius: 10,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  secondaryText: { fontSize: 16, fontWeight: '600' },
  linkButton: { minHeight: 40, alignItems: 'center', justifyContent: 'center' },
  linkText: { fontSize: 16, fontWeight: '600' },
  pressed: { opacity: 0.85 },
});
