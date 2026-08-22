import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ImagePeekOverlay } from '../../../src/games/grid-snap/components/ImagePeekOverlay';
import { PuzzleCanvas } from '../../../src/games/grid-snap/components/PuzzleCanvas';
import { IS_TEST_MODE } from '../../../src/games/grid-snap/core/testMode';
import { timeLimitSecForDifficulty } from '../../../src/games/grid-snap/core/timeLimit';
import type { SnapMode } from '../../../src/games/grid-snap/core/types';
import { useGridSnapStatsStore } from '../../../src/games/grid-snap/stores/gridSnapStatsStore';
import { useGridSnapStore } from '../../../src/games/grid-snap/stores/gridSnapStore';
import { GameEndExperience } from '../../../src/shared/components/GameEndExperience';
import { HeaderHomeButton } from '../../../src/shared/components/HeaderHomeButton';
import { HeaderTimer } from '../../../src/shared/components/HeaderTimer';
import type { GameEndMode, GameEndOutcome } from '../../../src/shared/gameEnd/gameEndConfig';
import { useGameTimeLimit } from '../../../src/shared/hooks/useGameTimeLimit';
import { useMusicUrgency } from '../../../src/shared/hooks/useMusicUrgency';
import { useFlushGameSessionOnBlur } from '../../../src/shared/hooks/useFlushGameSessionOnBlur';
import { useHardwareBack } from '../../../src/shared/hooks/useHardwareBack';
import { useTheme } from '../../../src/shared/theme/useTheme';
import { formatElapsedSeconds } from '../../../src/shared/utils/formatElapsed';

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
  useHardwareBack('/games/grid-snap');
  const { mode: modeParam, continue: continueParam } = useLocalSearchParams<{
    mode?: string;
    continue?: string;
  }>();
  const mode = resolveMode(modeParam);
  const continueGame = shouldContinue(continueParam);
  const {
    status,
    mode: activeMode,
    difficulty,
    gameSessionId,
    elapsedSec,
    setElapsedSec,
    resumeOrStartGame,
    startGame,
    handleTimeUp,
    imageDecodeReady,
    imageUrl,
    puzzle,
    peekUsed,
    markPeekUsed,
    persistSession,
  } = useGridSnapStore();
  const [peekVisible, setPeekVisible] = useState(false);

  const limitSec = useMemo(() => timeLimitSecForDifficulty(difficulty), [difficulty]);
  const timerActive = status === 'playing' && imageDecodeReady;

  const getBaseElapsedSec = useCallback(() => useGridSnapStore.getState().elapsedSec, []);
  const { remainingDisplay, remainingSec } = useGameTimeLimit({
    active: timerActive,
    resetKey: gameSessionId,
    getBaseElapsedSec,
    onTick: setElapsedSec,
    limitSec,
    onTimeUp: handleTimeUp,
  });

  useMusicUrgency({ active: timerActive, remainingSec });

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

  useFlushGameSessionOnBlur(persistSession);

  const goHome = useCallback(() => {
    void persistSession();
    router.replace('/games/grid-snap');
  }, [router, persistSession]);

  const handlePractice = useCallback(() => {
    void startGame('practice');
  }, [startGame]);

  const handlePlayAgain = useCallback(() => {
    void startGame(activeMode);
  }, [startGame, activeMode]);

  const handlePeekImage = useCallback(() => {
    if (peekUsed) {
      return;
    }

    if (IS_TEST_MODE) {
      if (!puzzle) {
        return;
      }
    } else if (!imageUrl) {
      return;
    }

    markPeekUsed();
    setPeekVisible(true);
  }, [imageUrl, markPeekUsed, peekUsed, puzzle]);

  const dismissPeek = useCallback(() => {
    setPeekVisible(false);
  }, []);

  const outcome: GameEndOutcome =
    status === 'won' ? 'won' : status === 'lost' ? 'lost' : 'playing';
  const headerLabel = mode === 'daily' ? 'Daily' : 'Practice';
  const endMessage =
    outcome === 'won' ? 'Puzzle complete!' : outcome === 'lost' ? "Time's up" : '';

  const timerDisplay = timerActive
    ? remainingDisplay
    : formatElapsedSeconds(Math.min(elapsedSec, limitSec));
  const canPeekImage =
    status === 'playing' &&
    imageDecodeReady &&
    !peekUsed &&
    (IS_TEST_MODE ? Boolean(puzzle) : Boolean(imageUrl));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <HeaderHomeButton onPress={goHome} />
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>{headerLabel}</Text>
        <HeaderTimer
          display={timerDisplay}
          variant={timerActive ? 'countdown' : 'elapsed'}
        />
      </View>

      {canPeekImage ? (
        <Pressable
          style={({ pressed }) => [
            styles.peekButton,
            { backgroundColor: theme.card, borderColor: theme.border },
            pressed && styles.pressed,
          ]}
          onPress={handlePeekImage}
          accessibilityRole="button"
          accessibilityLabel="Peek image"
        >
          <Text style={[styles.peekText, { color: theme.textPrimary }]}>Peek image</Text>
        </Pressable>
      ) : null}

      <View style={styles.boardArea}>
        <PuzzleCanvas key={gameSessionId} />
      </View>

      {IS_TEST_MODE && puzzle ? (
        <ImagePeekOverlay
          visible={peekVisible}
          testGrid={{ rows: puzzle.rows, cols: puzzle.cols }}
          onDismiss={dismissPeek}
        />
      ) : imageUrl ? (
        <ImagePeekOverlay visible={peekVisible} imageUrl={imageUrl} onDismiss={dismissPeek} />
      ) : null}

      <GameEndExperience
        outcome={outcome}
        mode={toEndMode(mode)}
        message={endMessage}
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
  peekButton: {
    alignSelf: 'center',
    marginBottom: 8,
    paddingHorizontal: 20,
    minHeight: 40,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  peekText: { fontSize: 14, fontWeight: '600' },
  pressed: { opacity: 0.85 },
  endArea: {
    flex: 0,
    justifyContent: 'flex-start',
    paddingTop: 8,
    paddingBottom: 16,
  },
});
