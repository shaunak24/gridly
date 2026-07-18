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

function shouldContinue(continueParam?: string): boolean {
  return continueParam === '1';
}

function toEndMode(mode: SnapMode): GameEndMode {
  return mode;
}

export default function GridSnapPlayScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { mode: modeParam, continue: continueParam } = useLocalSearchParams<{
    mode?: string;
    continue?: string;
  }>();
  const mode = resolveMode(modeParam);
  const continueGame = shouldContinue(continueParam);
  const { status, mode: activeMode, gameSessionId, resumeOrStartGame, startGame } = useGridSnapStore();

  useEffect(() => {
    const init = async () => {
      if (mode === 'daily' && useGridSnapStatsStore.getState().isDailyCompleteToday()) {
        const started = await resumeOrStartGame('daily');
        if (!started) {
          router.replace('/games/grid-snap');
        }
        return;
      }

      if (continueGame) {
        await resumeOrStartGame(mode);
        return;
      }

      await startGame(mode);
    };

    void init();
  }, [mode, continueGame, resumeOrStartGame, startGame, router]);

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
  const headerLabel = mode === 'daily' ? 'Daily' : 'Practice';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <HeaderHomeButton onPress={goHome} />
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>{headerLabel}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.boardArea}>
        <PuzzleCanvas key={gameSessionId} />
      </View>

      <GameEndExperience
        outcome={outcome}
        mode={toEndMode(mode)}
        message="Puzzle complete!"
        onPlayAgain={handlePlayAgain}
        onPractice={handlePractice}
        endAreaStyle={styles.endArea}
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
    minHeight: 0,
  },
  endArea: {
    flex: 0,
    justifyContent: 'flex-start',
    paddingTop: 8,
    paddingBottom: 16,
  },
});
