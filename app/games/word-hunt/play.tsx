import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Board } from '../../../src/games/word-hunt/components/Board';
import { Keyboard } from '../../../src/games/word-hunt/components/Keyboard';
import { decodeCustomWord } from '../../../src/games/word-hunt/core/customPuzzle';
import { formatShareGrid } from '../../../src/games/word-hunt/core/share';
import type { GameMode } from '../../../src/games/word-hunt/core/types';
import { useGameStore } from '../../../src/games/word-hunt/stores/gameStore';
import { useStatsStore } from '../../../src/games/word-hunt/stores/statsStore';
import { GameEndExperience } from '../../../src/shared/components/GameEndExperience';
import { HeaderHomeButton } from '../../../src/shared/components/HeaderHomeButton';
import type { GameEndMode, GameEndOutcome } from '../../../src/shared/gameEnd/gameEndConfig';
import { useTheme } from '../../../src/shared/theme/useTheme';

function resolveMode(modeParam?: string): GameMode {
  if (modeParam === 'daily') {
    return 'daily';
  }
  if (modeParam === 'custom') {
    return 'custom';
  }
  return 'practice';
}

function toEndMode(mode: GameMode): GameEndMode {
  return mode;
}

export default function WordHuntPlayScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { mode: modeParam, code: codeParam } = useLocalSearchParams<{
    mode?: string;
    code?: string;
  }>();
  const mode = resolveMode(modeParam);
  const customCode = typeof codeParam === 'string' ? codeParam : undefined;

  const {
    status,
    secretWord,
    guesses,
    currentGuess,
    currentRowIndex,
    letterStates,
    errorMessage,
    shakeRow,
    startGame,
    resumeOrStartGame,
    appendLetter,
    removeLetter,
    submitGuess,
    clearShake,
  } = useGameStore();

  useEffect(() => {
    const init = async () => {
      if (mode === 'custom') {
        const word = customCode ? decodeCustomWord(customCode) : null;
        if (!word) {
          Alert.alert('Invalid puzzle', 'This custom puzzle link is not valid.');
          router.replace('/games/word-hunt');
          return;
        }
        const started = await resumeOrStartGame('custom', { secretWord: word });
        if (!started) {
          router.replace('/games/word-hunt');
        }
        return;
      }

      if (mode === 'daily' && useStatsStore.getState().isDailyCompleteToday()) {
        const started = await resumeOrStartGame('daily');
        if (!started) {
          router.replace('/games/word-hunt');
        }
        return;
      }

      await resumeOrStartGame(mode);
    };

    void init();
  }, [resumeOrStartGame, mode, customCode, router]);

  const handlePractice = useCallback(() => {
    startGame('practice');
  }, [startGame]);

  const handlePlayAgain = useCallback(() => {
    if (mode === 'custom') {
      const word = customCode ? decodeCustomWord(customCode) : null;
      if (word) {
        startGame('custom', { secretWord: word });
      }
      return;
    }
    startGame('practice');
  }, [startGame, mode, customCode]);

  const handleShare = useCallback(async () => {
    const text = formatShareGrid(
      guesses,
      currentRowIndex,
      status === 'won',
      mode,
      new Date(),
      secretWord,
    );
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied', 'Results copied to clipboard.');
  }, [guesses, currentRowIndex, status, mode, secretWord]);

  const goHome = useCallback(() => {
    router.replace('/games/word-hunt');
  }, [router]);

  const outcome: GameEndOutcome =
    status === 'won' ? 'won' : status === 'lost' ? 'lost' : 'playing';
  const isPlaying = outcome === 'playing';
  const isFinished = outcome !== 'playing';
  const winGuessCount = currentRowIndex;

  const endMessage =
    outcome === 'won'
      ? `Solved in ${winGuessCount} ${winGuessCount === 1 ? 'guess' : 'guesses'}`
      : outcome === 'lost'
        ? `The word was ${secretWord}`
        : '';

  const headerLabel =
    mode === 'daily' ? 'Daily' : mode === 'custom' ? 'Custom' : 'Practice';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <HeaderHomeButton onPress={goHome} />
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>{headerLabel}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={[styles.boardArea, isFinished && styles.boardAreaFinished]}>
        <Board
          guesses={guesses}
          currentGuess={currentGuess}
          currentRowIndex={currentRowIndex}
          shakeRow={shakeRow}
          onShakeComplete={clearShake}
        />
        {errorMessage ? (
          <Text style={[styles.error, { color: theme.danger }]}>{errorMessage}</Text>
        ) : null}
      </View>

      <GameEndExperience
        outcome={outcome}
        mode={toEndMode(mode)}
        message={endMessage}
        onPlayAgain={handlePlayAgain}
        onPractice={handlePractice}
        onShare={handleShare}
      />

      {isPlaying ? (
        <Keyboard
          letterStates={letterStates}
          onKey={appendLetter}
          onBackspace={removeLetter}
          onSubmit={submitGuess}
        />
      ) : null}
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
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  boardAreaFinished: {
    flex: 0,
    paddingTop: 8,
    paddingBottom: 16,
  },
  error: { fontSize: 14, fontWeight: '600' },
});
