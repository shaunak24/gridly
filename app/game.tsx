import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Board } from '../src/components/Board';
import { GameEndBar } from '../src/components/GameEndBar';
import { GameModal } from '../src/components/GameModal';
import { HeaderHomeButton } from '../src/components/HeaderHomeButton';
import { Keyboard } from '../src/components/Keyboard';
import { formatShareGrid } from '../src/core/share';
import type { GameMode } from '../src/core/types';
import { useGameStore } from '../src/stores/gameStore';
import { useTheme } from '../src/theme/useTheme';

const END_MODAL_DELAY_MS = 2000;

export default function GameScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { mode: modeParam } = useLocalSearchParams<{ mode?: string }>();
  const mode: GameMode = modeParam === 'daily' ? 'daily' : 'practice';

  const [endModalVisible, setEndModalVisible] = useState(false);
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
    void resumeOrStartGame(mode);
  }, [resumeOrStartGame, mode]);

  useEffect(() => {
    if (status !== 'won' && status !== 'lost') {
      setEndModalVisible(false);
      return;
    }

    setEndModalVisible(false);
    const timer = setTimeout(() => setEndModalVisible(true), END_MODAL_DELAY_MS);
    return () => clearTimeout(timer);
  }, [status]);

  const handlePlayAgain = useCallback(() => {
    setEndModalVisible(false);
    startGame('practice');
  }, [startGame]);

  const handleShare = useCallback(async () => {
    const text = formatShareGrid(
      guesses,
      currentRowIndex,
      status === 'won',
      mode,
    );
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied', 'Results copied to clipboard.');
  }, [guesses, currentRowIndex, status, mode]);

  const goHome = useCallback(() => {
    router.replace('/');
  }, [router]);

  const isPlaying = status === 'playing';
  const isFinished = status === 'won' || status === 'lost';
  const winGuessCount = currentRowIndex;

  const endMessage =
    status === 'won'
      ? `Solved in ${winGuessCount} ${winGuessCount === 1 ? 'guess' : 'guesses'}`
      : status === 'lost'
        ? `The word was ${secretWord}`
        : '';

  const headerLabel = mode === 'daily' ? 'Daily' : 'Practice';

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

      {isFinished ? (
        <View style={styles.endArea}>
          <GameEndBar
            message={endMessage}
            onPlayAgain={handlePlayAgain}
            onShare={status === 'won' ? handleShare : undefined}
            shareLabel={mode === 'daily' ? 'Share' : undefined}
            prominent
          />
        </View>
      ) : null}

      {isPlaying ? (
        <Keyboard
          letterStates={letterStates}
          onKey={appendLetter}
          onBackspace={removeLetter}
          onSubmit={submitGuess}
        />
      ) : null}

      <GameModal
        visible={status === 'won' && endModalVisible}
        title="You got it!"
        message={endMessage}
        primaryLabel={mode === 'daily' ? 'Practice' : 'Play again'}
        onPrimary={handlePlayAgain}
        onDismiss={() => setEndModalVisible(false)}
      />

      <GameModal
        visible={status === 'lost' && endModalVisible}
        title="Nice try"
        message={endMessage}
        primaryLabel="Practice"
        onPrimary={handlePlayAgain}
        onDismiss={() => setEndModalVisible(false)}
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
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  boardAreaFinished: {
    flex: 0,
    paddingTop: 8,
    paddingBottom: 16,
  },
  endArea: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingBottom: 24,
  },
  error: { fontSize: 14, fontWeight: '600' },
});
