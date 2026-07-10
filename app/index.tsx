import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GridLogo } from '../src/components/GridLogo';
import { HeaderIconButton } from '../src/components/HeaderIconButton';
import { ThemeToggleButton } from '../src/components/ThemeToggleButton';
import { Wordmark } from '../src/components/Wordmark';
import { useDailyCountdown } from '../src/hooks/useDailyCountdown';
import { useGameStore } from '../src/stores/gameStore';
import { useStatsStore } from '../src/stores/statsStore';
import { useTheme } from '../src/theme/useTheme';
import { formatDailyCountdownTimer } from '../src/utils/dailyCountdown';

export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const dailyDone = useStatsStore((s) => s.isDailyCompleteToday());
  const gamesPlayed = useStatsStore((s) => s.gamesPlayed);
  const currentStreak = useStatsStore((s) => s.currentStreak);
  const dailyInProgress = useGameStore((s) => s.dailyInProgress);
  const practiceInProgress = useGameStore((s) => s.practiceInProgress);
  const remainingMs = useDailyCountdown(dailyDone);

  const startDaily = () => {
    router.push({ pathname: '/game', params: { mode: 'daily' } });
  };

  const startPractice = () => {
    router.push({ pathname: '/game', params: { mode: 'practice' } });
  };

  const dailyLabel = dailyDone
    ? "Today's puzzle complete"
    : dailyInProgress
      ? 'Continue daily'
      : 'Play daily';

  const practiceLabel = practiceInProgress ? 'Continue practice' : 'Practice';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.topBar}>
        <View style={styles.topBarSpacer} />
        <View style={styles.topBarActions}>
          <ThemeToggleButton />
          <HeaderIconButton
            name="settings-outline"
            onPress={() => router.push('/settings')}
            accessibilityLabel="Settings"
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.content}>
          <GridLogo size={120} />
          <Wordmark />
          <Text style={[styles.tagline, { color: theme.textSecondary }]}>
            Guess the word in six tries.
          </Text>
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
            onPress={startDaily}
            disabled={dailyDone}
            accessibilityRole="button"
            accessibilityLabel={
              dailyDone
                ? `${dailyLabel}. Next puzzle in ${formatDailyCountdownTimer(remainingMs)}`
                : dailyLabel
            }
          >
            <Text
              style={[
                styles.primaryText,
                dailyDone && styles.primaryTextDone,
                { color: theme.textPrimary },
              ]}
            >
              {dailyLabel}
            </Text>
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
            onPress={startPractice}
            accessibilityRole="button"
            accessibilityLabel={practiceLabel}
          >
            <Text style={[styles.secondaryText, { color: theme.textPrimary }]}>{practiceLabel}</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.secondaryButton,
              { backgroundColor: theme.card, borderColor: theme.border },
              pressed && styles.pressed,
            ]}
            onPress={() => router.push('/create-puzzle')}
            accessibilityRole="button"
            accessibilityLabel="Create puzzle"
          >
            <Text style={[styles.secondaryText, { color: theme.textPrimary }]}>Create puzzle</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.linkButton, pressed && styles.pressed]}
            onPress={() => router.push('/stats')}
          >
            <Text style={[styles.linkText, { color: theme.textSecondary }]}>Stats</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.linkButton, pressed && styles.pressed]}
            onPress={() => router.push('/how-to-play')}
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
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
  },
  topBarSpacer: { flex: 1 },
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    gap: 12,
  },
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
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 56,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  disabledButton: { opacity: 0.55 },
  primaryText: { fontSize: 18, fontWeight: '700' },
  primaryTextDone: {
    fontSize: 16,
    textAlign: 'center',
  },
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
