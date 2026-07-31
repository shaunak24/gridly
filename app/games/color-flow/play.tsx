import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FlowBoardView } from '../../../src/games/color-flow/components/FlowBoard';
import { filledCellCount } from '../../../src/games/color-flow/core/flowEngine';
import type { FlowMode } from '../../../src/games/color-flow/core/types';
import { useColorFlowStatsStore } from '../../../src/games/color-flow/stores/colorFlowStatsStore';
import { useColorFlowStore } from '../../../src/games/color-flow/stores/colorFlowStore';
import { GameEndExperience } from '../../../src/shared/components/GameEndExperience';
import { HeaderHomeButton } from '../../../src/shared/components/HeaderHomeButton';
import { HeaderTimer } from '../../../src/shared/components/HeaderTimer';
import { presentAppMessage } from '../../../src/shared/components/presentAppMessage';
import type { GameEndMode, GameEndOutcome } from '../../../src/shared/gameEnd/gameEndConfig';
import { useGameTimer } from '../../../src/shared/hooks/useGameTimer';
import { useTheme } from '../../../src/shared/theme/useTheme';
import { formatElapsedSeconds } from '../../../src/shared/utils/formatElapsed';
import { success } from '../../../src/shared/utils/haptics';

function resolveMode(modeParam?: string): FlowMode {
  return modeParam === 'daily' ? 'daily' : 'practice';
}

function shouldContinue(continueParam?: string): boolean {
  return continueParam === '1';
}

function toEndMode(mode: FlowMode): GameEndMode {
  return mode;
}

export default function ColorFlowPlayScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { mode: modeParam, continue: continueParam } = useLocalSearchParams<{
    mode?: string;
    continue?: string;
  }>();
  const mode = resolveMode(modeParam);
  const continueGame = shouldContinue(continueParam);

  // Per-field selectors: the timer ticks once a second, and a whole-store
  // subscription would re-render the board on every tick.
  const status = useColorFlowStore((state) => state.status);
  const activeMode = useColorFlowStore((state) => state.mode);
  const gameSessionId = useColorFlowStore((state) => state.gameSessionId);
  const elapsedSec = useColorFlowStore((state) => state.elapsedSec);
  const board = useColorFlowStore((state) => state.board);
  const gameState = useColorFlowStore((state) => state.gameState);
  const activeColorId = useColorFlowStore((state) => state.activeColorId);
  const setElapsedSec = useColorFlowStore((state) => state.setElapsedSec);
  const resumeOrStartGame = useColorFlowStore((state) => state.resumeOrStartGame);
  const startGame = useColorFlowStore((state) => state.startGame);
  const beginDrag = useColorFlowStore((state) => state.beginDrag);
  const extendDrag = useColorFlowStore((state) => state.extendDrag);
  const commitDrag = useColorFlowStore((state) => state.commitDrag);
  const resetBoard = useColorFlowStore((state) => state.resetBoard);

  const getBaseElapsedSec = useCallback(() => useColorFlowStore.getState().elapsedSec, []);
  const { display: timerDisplay } = useGameTimer({
    active: status === 'playing',
    resetKey: gameSessionId,
    getBaseElapsedSec,
    onTick: setElapsedSec,
  });

  useEffect(() => {
    const init = async () => {
      if (mode === 'daily' && useColorFlowStatsStore.getState().isDailyCompleteToday()) {
        const started = await resumeOrStartGame('daily');
        if (!started) {
          router.replace('/games/color-flow');
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

  useEffect(() => {
    if (status === 'won') {
      success();
    }
  }, [status]);

  const goHome = useCallback(() => {
    router.replace('/games/color-flow');
  }, [router]);

  const handlePractice = useCallback(() => {
    void startGame('practice');
  }, [startGame]);

  const handlePlayAgain = useCallback(() => {
    void startGame(activeMode);
  }, [startGame, activeMode]);

  const handleReset = useCallback(() => {
    presentAppMessage({
      title: 'Reset board?',
      body: 'This clears every flow you have drawn. The puzzle and timer stay the same.',
      emoji: '🧹',
      primaryLabel: 'Reset',
      onPrimary: resetBoard,
      secondaryLabel: 'Cancel',
    });
  }, [resetBoard]);

  const outcome: GameEndOutcome = status === 'won' ? 'won' : 'playing';
  const headerLabel = mode === 'daily' ? 'Daily' : 'Practice';
  const canReset = status === 'playing' && Boolean(gameState) && filledCellCount(gameState!.paths) > 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <HeaderHomeButton onPress={goHome} />
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>{headerLabel}</Text>
        <HeaderTimer
          display={status === 'playing' ? timerDisplay : formatElapsedSeconds(elapsedSec)}
        />
      </View>

      <View style={styles.boardArea}>
        {board && gameState ? (
          <FlowBoardView
            key={gameSessionId}
            board={board}
            gameState={gameState}
            activeColorId={activeColorId}
            isPlaying={status === 'playing'}
            onBeginDrag={beginDrag}
            onExtendDrag={extendDrag}
            onCommitDrag={commitDrag}
          />
        ) : null}
      </View>

      {canReset ? (
        <Pressable
          style={({ pressed }) => [
            styles.resetButton,
            { backgroundColor: theme.card, borderColor: theme.border },
            pressed && styles.pressed,
          ]}
          onPress={handleReset}
          accessibilityRole="button"
          accessibilityLabel="Reset board"
        >
          <Text style={[styles.resetText, { color: theme.textPrimary }]}>Reset board</Text>
        </Pressable>
      ) : null}

      <GameEndExperience
        outcome={outcome}
        mode={toEndMode(mode)}
        message="Flow complete!"
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
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  boardArea: { flex: 1, minHeight: 0, justifyContent: 'center' },
  resetButton: {
    alignSelf: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
    minHeight: 40,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetText: { fontSize: 14, fontWeight: '600' },
  pressed: { opacity: 0.85 },
  endArea: {
    flex: 0,
    justifyContent: 'flex-start',
    paddingTop: 8,
    paddingBottom: 16,
  },
});
