import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { formatDailyCountdownTimer } from '../../../src/games/word-hunt/hooks/dailyCountdownUtil';
import { useDailyCountdown } from '../../../src/games/word-hunt/hooks/useDailyCountdown';
import { ColorFlowIcon } from '../../../src/games/color-flow/components/ColorFlowIcon';
import { SEASON_1_ID } from '../../../src/games/color-flow/core/seasons';
import { useColorFlowCampaignStore } from '../../../src/games/color-flow/stores/colorFlowCampaignStore';
import { useColorFlowStatsStore } from '../../../src/games/color-flow/stores/colorFlowStatsStore';
import { useColorFlowStore } from '../../../src/games/color-flow/stores/colorFlowStore';
import { HeaderBackButton } from '../../../src/shared/components/HeaderBackButton';
import { HeaderIconButton } from '../../../src/shared/components/HeaderIconButton';
import { useHardwareBack } from '../../../src/shared/hooks/useHardwareBack';
import { useTheme } from '../../../src/shared/theme/useTheme';

export default function ColorFlowHubScreen() {
  const router = useRouter();
  const theme = useTheme();
  useHardwareBack('/home');

  const hydrateCampaign = useColorFlowCampaignStore((s) => s.hydrate);
  const campaignProgress = useColorFlowCampaignStore((s) => s.progress);
  const getCurrentLevel = useColorFlowCampaignStore((s) => s.getCurrentLevel);

  const dailyDone = useColorFlowStatsStore((s) => s.isDailyCompleteToday());
  const dailyStats = useColorFlowStatsStore((s) => s.getDailyStats());
  const gamesPlayed = dailyStats.gamesPlayed;
  const currentStreak = dailyStats.currentStreak;
  const dailyInProgress = useColorFlowStore((s) => s.dailyInProgress);
  const practiceInProgress = useColorFlowStore((s) => s.practiceInProgress);
  const campaignInProgress = useColorFlowStore((s) => s.campaignInProgress);
  const remainingMs = useDailyCountdown(dailyDone);

  const seasonId = campaignProgress.activeSeasonId || SEASON_1_ID;
  const seasonStats = campaignProgress.seasons[seasonId];
  const completedCount = seasonStats?.completedLevels.length ?? 0;
  const currentLevel = getCurrentLevel(seasonId);

  useEffect(() => {
    void hydrateCampaign();
  }, [hydrateCampaign]);

  const journeyLabel = campaignInProgress ? `Continue Level ${currentLevel}` : `Play Level ${currentLevel}`;

  const dailyLabel = dailyDone
    ? "Today's puzzle complete"
    : dailyInProgress
      ? 'Continue daily'
      : 'Play daily';

  const practiceLabel = practiceInProgress ? 'Continue practice' : 'Practice';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.topBar}>
        <HeaderBackButton onPress={() => router.replace('/home')} />
        <Text style={[styles.gameTitle, { color: theme.textPrimary }]}>Color Flow</Text>
        <HeaderIconButton
          name="settings-outline"
          onPress={() => router.push('/games/color-flow/settings')}
          accessibilityLabel="Color Flow settings"
        />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.content}>
          <ColorFlowIcon size={96} />
          <Text style={[styles.tagline, { color: theme.textSecondary }]}>
            Connect the dots. Fill the grid.
          </Text>
          {completedCount > 0 ? (
            <Text style={[styles.progressChip, { color: theme.coral }]}>
              Season 1 · {completedCount} / 100 complete
            </Text>
          ) : null}
          {gamesPlayed > 0 ? (
            <Text style={[styles.streak, { color: theme.textSecondary }]}>
              Daily streak: {currentStreak} · Played: {gamesPlayed}
            </Text>
          ) : null}
        </View>

        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              { backgroundColor: theme.coral },
              pressed && styles.pressed,
            ]}
            onPress={() => router.replace('/games/color-flow/journey')}
          >
            <Text style={[styles.primaryText, { color: theme.textPrimary }]}>{journeyLabel}</Text>
            <Text style={[styles.primarySubtext, { color: theme.textPrimary }]}>Flow Path</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.secondaryButton,
              { backgroundColor: theme.card, borderColor: theme.border },
              dailyDone && styles.disabledButton,
              pressed && !dailyDone && styles.pressed,
            ]}
            onPress={() =>
              router.push({
                pathname: '/games/color-flow/play',
                params: {
                  mode: 'daily',
                  continue: dailyInProgress && !dailyDone ? '1' : '0',
                },
              })
            }
            disabled={dailyDone}
          >
            <Text style={[styles.secondaryText, { color: theme.textPrimary }]}>{dailyLabel}</Text>
            {dailyDone ? (
              <Text style={[styles.countdownText, { color: theme.textSecondary }]}>
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
            onPress={() =>
              router.push({
                pathname: '/games/color-flow/play',
                params: { mode: 'practice', continue: practiceInProgress ? '1' : '0' },
              })
            }
          >
            <Text style={[styles.secondaryText, { color: theme.textPrimary }]}>{practiceLabel}</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.linkButton, pressed && styles.pressed]}
            onPress={() => router.push('/games/color-flow/stats')}
          >
            <Text style={[styles.linkText, { color: theme.textSecondary }]}>Stats</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.linkButton, pressed && styles.pressed]}
            onPress={() => router.push('/games/color-flow/how-to-play')}
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
  progressChip: { fontSize: 14, fontWeight: '700' },
  streak: { fontSize: 14, fontWeight: '600' },
  actions: { gap: 10, marginTop: 32 },
  primaryButton: {
    borderRadius: 10,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  primaryText: { fontSize: 18, fontWeight: '700' },
  primarySubtext: { fontSize: 13, fontWeight: '600', opacity: 0.85, marginTop: 2 },
  disabledButton: { opacity: 0.55 },
  secondaryButton: {
    borderRadius: 10,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    position: 'relative',
    paddingHorizontal: 16,
  },
  secondaryText: { fontSize: 16, fontWeight: '600' },
  countdownText: {
    position: 'absolute',
    right: 12,
    bottom: 6,
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  linkButton: { minHeight: 40, alignItems: 'center', justifyContent: 'center' },
  linkText: { fontSize: 16, fontWeight: '600' },
  pressed: { opacity: 0.85 },
});
