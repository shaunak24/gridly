import { useRouter } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FlowPathMap } from '../../../src/games/color-flow/components/FlowPathMap';
import { SEASON_1_ID } from '../../../src/games/color-flow/core/seasons';
import type { PersistedFlowGame } from '../../../src/games/color-flow/core/types';
import { useColorFlowCampaignStore } from '../../../src/games/color-flow/stores/colorFlowCampaignStore';
import { useColorFlowStore } from '../../../src/games/color-flow/stores/colorFlowStore';
import { HeaderBackButton } from '../../../src/shared/components/HeaderBackButton';
import { useHardwareBack } from '../../../src/shared/hooks/useHardwareBack';
import { loadJson, storageKeys } from '../../../src/shared/services/storage';
import { useTheme } from '../../../src/shared/theme/useTheme';

export default function ColorFlowJourneyScreen() {
  const router = useRouter();
  const theme = useTheme();
  useHardwareBack('/games/color-flow');

  const hydrate = useColorFlowCampaignStore((s) => s.hydrate);
  const progress = useColorFlowCampaignStore((s) => s.progress);
  const getCurrentLevel = useColorFlowCampaignStore((s) => s.getCurrentLevel);
  const isLevelPlayable = useColorFlowCampaignStore((s) => s.isLevelPlayable);
  const campaignInProgress = useColorFlowStore((s) => s.campaignInProgress);

  const seasonId = progress.activeSeasonId || SEASON_1_ID;
  const seasonProgress = progress.seasons[seasonId];
  const highestUnlocked = seasonProgress?.highestUnlocked ?? 1;
  const completedLevels = seasonProgress?.completedLevels ?? [];
  const currentLevel = getCurrentLevel(seasonId);

  useEffect(() => {
    const state = useColorFlowCampaignStore.getState();
    if (!state.hydrated) {
      void hydrate();
    }
  }, [hydrate]);

  const playLevel = useCallback(
    async (targetLevel: number, shouldContinue = false) => {
      if (!isLevelPlayable(seasonId, targetLevel)) {
        return;
      }

      if (!shouldContinue) {
        await useColorFlowStore.getState().startGame('campaign', { seasonId, level: targetLevel });
      }

      router.replace({
        pathname: '/games/color-flow/play',
        params: {
          mode: 'campaign',
          season: seasonId,
          level: String(targetLevel),
          continue: shouldContinue ? '1' : '0',
        },
      });
    },
    [isLevelPlayable, router, seasonId],
  );

  const continueCurrent = useCallback(async () => {
    if (campaignInProgress) {
      const saved = await loadJson<PersistedFlowGame>(storageKeys.colorFlowSavedCampaign);
      const resumeSeason = saved?.seasonId ?? seasonId;
      const resumeLevel = saved?.level ?? currentLevel;
      router.replace({
        pathname: '/games/color-flow/play',
        params: {
          mode: 'campaign',
          season: resumeSeason,
          level: String(resumeLevel),
          continue: '1',
        },
      });
      return;
    }
    await playLevel(currentLevel, false);
  }, [campaignInProgress, currentLevel, playLevel, router, seasonId]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.topBar}>
        <HeaderBackButton onPress={() => router.replace('/games/color-flow')} />
        <Text style={[styles.title, { color: theme.textPrimary }]}>Flow Path</Text>
        <View style={styles.spacer} />
      </View>

      <View style={styles.mapArea}>
        <FlowPathMap
          seasonId={seasonId}
          highestUnlocked={highestUnlocked}
          completedLevels={completedLevels}
          onSelectLevel={(level) => playLevel(level, false)}
        />
      </View>

      <View style={[styles.footer, { borderTopColor: theme.border }]}>
        <Pressable
          style={({ pressed }) => [
            styles.playButton,
            { backgroundColor: theme.coral },
            pressed && styles.pressed,
          ]}
          onPress={continueCurrent}
        >
          <Text style={[styles.playButtonText, { color: theme.textPrimary }]}>
            {campaignInProgress ? `Continue Level ${currentLevel}` : `Play Level ${currentLevel}`}
          </Text>
        </Pressable>
      </View>
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
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  spacer: { width: 40 },
  mapArea: { flex: 1 },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
  },
  playButton: {
    borderRadius: 10,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonText: {
    fontSize: 18,
    fontWeight: '700',
  },
  pressed: { opacity: 0.85 },
});
