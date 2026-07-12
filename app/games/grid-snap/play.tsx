import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PuzzleCanvas } from '../../../src/games/grid-snap/components/PuzzleCanvas';
import type { SnapMode } from '../../../src/games/grid-snap/core/types';
import { useGridSnapStatsStore } from '../../../src/games/grid-snap/stores/gridSnapStatsStore';
import { useGridSnapStore } from '../../../src/games/grid-snap/stores/gridSnapStore';
import { GameEndExperience } from '../../../src/shared/components/GameEndExperience';
import { HeaderHomeButton } from '../../../src/shared/components/HeaderHomeButton';
import type { GameEndMode, GameEndOutcome } from '../../../src/shared/gameEnd/gameEndConfig';
import { useTheme } from '../../../src/shared/theme/useTheme';

function resolveMode(modeParam?: string): SnapMode {
  return modeParam === 'daily' ? 'daily' : 'practice';
}

function toEndMode(mode: SnapMode): GameEndMode {
  return mode;
}

export default function GridSnapPlayScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { mode: modeParam } = useLocalSearchParams<{ mode?: string }>();
  const mode = resolveMode(modeParam);
  const { status, mode: activeMode, resumeOrStartGame, startGame } = useGridSnapStore();

  useEffect(() => {
    const init = async () => {
      if (mode === 'daily' && useGridSnapStatsStore.getState().isDailyCompleteToday()) {
        const started = await resumeOrStartGame('daily');
        if (!started) {
          router.replace('/games/grid-snap');
        }
        return;
      }

      await resumeOrStartGame(mode);
    };

    void init();
  }, [mode, resumeOrStartGame, router]);

  const goHome = useCallback(() => {
    router.replace('/games/grid-snap');
  }, [router]);

  const handlePractice = useCallback(() => {
    void startGame('practice');
  }, [startGame]);

  const handlePlayAgain = useCallback(() => {
    void startGame(activeMode);
  }, [startGame, activeMode]);

  const outcome: GameEndOutcome = status === 'won' ? 'won' : 'playing';
  const isFinished = outcome !== 'playing';
  const headerLabel = mode === 'daily' ? 'Daily' : 'Practice';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <HeaderHomeButton onPress={goHome} />
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>{headerLabel}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={[styles.boardArea, isFinished && styles.boardAreaFinished]}>
        <PuzzleCanvas compact={isFinished} />
      </View>

      <GameEndExperience
        outcome={outcome}
        mode={toEndMode(mode)}
        message="Puzzle complete!"
        onPlayAgain={handlePlayAgain}
        onPractice={handlePractice}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 12, paddingBottom: 8 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    marginBottom: 8,
  },
  headerSpacer: { width: 96 },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  boardArea: {
    flex: 1,
  },
  boardAreaFinished: {
    flex: 0,
    paddingTop: 8,
    paddingBottom: 16,
  },
});
