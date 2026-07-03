import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Board } from '../src/components/Board';
import { Keyboard } from '../src/components/Keyboard';
import { SpeechBalloon } from '../src/components/SpeechBalloon';
import { mergeLetterStates, scoreGuess } from '../src/core/gameEngine';
import {
  FLIP_REVEAL_MS,
  TUTORIAL_SECRET,
  TUTORIAL_STEPS,
  type TutorialStep,
} from '../src/core/tutorialScript';
import type { GuessRow, TileState } from '../src/core/types';
import { MAX_GUESSES, WORD_LENGTH } from '../src/core/types';
import { useTheme } from '../src/theme/useTheme';

function emptyRow(): GuessRow {
  return {
    letters: Array(WORD_LENGTH).fill(''),
    states: Array(WORD_LENGTH).fill('empty') as TileState[],
  };
}

function createEmptyBoard(): GuessRow[] {
  return Array.from({ length: MAX_GUESSES }, emptyRow);
}

export default function HowToPlayScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [stepIndex, setStepIndex] = useState(0);
  const [guesses, setGuesses] = useState<GuessRow[]>(createEmptyBoard);
  const [currentGuess, setCurrentGuess] = useState('');
  const [currentRowIndex, setCurrentRowIndex] = useState(0);
  const [letterStates, setLetterStates] = useState<
    Record<string, 'default' | 'correct' | 'present' | 'absent'>
  >({});
  const [shakeRow, setShakeRow] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);
  const [awaitingReveal, setAwaitingReveal] = useState(false);

  const step: TutorialStep = TUTORIAL_STEPS[stepIndex];
  const isComplete = step.id === 'complete';
  const isTypingStep = step.kind === 'type' && !awaitingReveal;
  const showKeyboard = isTypingStep;

  const advanceStep = useCallback(() => {
    setStepIndex((index) => Math.min(index + 1, TUTORIAL_STEPS.length - 1));
    setInputError(null);
  }, []);

  const submitTutorialGuess = useCallback(() => {
    if (step.kind !== 'type' || !step.expectedWord || awaitingReveal) {
      return;
    }

    if (currentGuess.length !== WORD_LENGTH) {
      return;
    }

    if (currentGuess.toUpperCase() !== step.expectedWord.toUpperCase()) {
      setInputError(`Type ${step.expectedWord} exactly, then tap Enter.`);
      setShakeRow(true);
      return;
    }

    const scored = scoreGuess(TUTORIAL_SECRET, currentGuess);
    const rowIndex = currentRowIndex;

    setGuesses((rows) =>
      rows.map((row, index) => {
        if (index !== rowIndex) {
          return row;
        }
        return {
          letters: currentGuess.split(''),
          states: scored.map((tile) => tile.state) as TileState[],
        };
      }),
    );
    setLetterStates((states) => mergeLetterStates(states, scored));
    setCurrentGuess('');
    setCurrentRowIndex(rowIndex + 1);
    setInputError(null);
    setAwaitingReveal(true);

    setTimeout(() => {
      setAwaitingReveal(false);
      advanceStep();
    }, FLIP_REVEAL_MS);
  }, [advanceStep, awaitingReveal, currentGuess, currentRowIndex, step]);

  const appendLetter = useCallback(
    (letter: string) => {
      if (!isTypingStep) {
        return;
      }
      setCurrentGuess((guess) => {
        if (guess.length >= WORD_LENGTH) {
          return guess;
        }
        setInputError(null);
        return `${guess}${letter}`;
      });
    },
    [isTypingStep],
  );

  const removeLetter = useCallback(() => {
    if (!isTypingStep) {
      return;
    }
    setCurrentGuess((guess) => guess.slice(0, -1));
    setInputError(null);
  }, [isTypingStep]);

  const clearShake = useCallback(() => setShakeRow(false), []);

  const balloonMessage = useMemo(() => {
    if (inputError) {
      return inputError;
    }
    if (awaitingReveal) {
      return 'Checking your guess…';
    }
    return step.message;
  }, [awaitingReveal, inputError, step.message]);

  const balloonAction = step.kind === 'continue' && !awaitingReveal
    ? isComplete
      ? undefined
      : 'Next'
    : undefined;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.closeButton}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <Text style={[styles.closeText, { color: theme.textSecondary }]}>✕</Text>
        </Pressable>
        <Text style={[styles.title, { color: theme.textPrimary }]}>How to play</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.body}>
        <View style={styles.balloonArea}>
          <SpeechBalloon
            actionLabel={balloonAction}
            onAction={balloonAction ? advanceStep : undefined}
          >
            {balloonMessage}
          </SpeechBalloon>
        </View>

        <View style={[styles.boardArea, showKeyboard && styles.boardAreaCompact]}>
          <Board
            guesses={guesses}
            currentGuess={currentGuess}
            currentRowIndex={currentRowIndex}
            shakeRow={shakeRow}
            onShakeComplete={clearShake}
            compact={showKeyboard}
          />
        </View>
      </View>

      {showKeyboard ? (
        <View style={styles.keyboardArea}>
          <Keyboard
            letterStates={letterStates}
            onKey={appendLetter}
            onBackspace={removeLetter}
            onSubmit={submitTutorialGuess}
          />
        </View>
      ) : null}

      {isComplete ? (
        <Pressable
          style={({ pressed }) => [
            styles.playButton,
            { backgroundColor: theme.coral },
            pressed && styles.pressed,
          ]}
          onPress={() => router.replace({ pathname: '/game', params: { mode: 'practice' } })}
          accessibilityRole="button"
          accessibilityLabel="Start practice"
        >
          <Text style={[styles.playText, { color: theme.textPrimary }]}>Start practice</Text>
        </Pressable>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: { fontSize: 20 },
  headerSpacer: { width: 44 },
  title: { fontSize: 20, fontWeight: '700' },
  body: {
    flex: 1,
    minHeight: 0,
  },
  balloonArea: {
    paddingHorizontal: 4,
    paddingBottom: 4,
    alignItems: 'center',
  },
  boardArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 0,
  },
  boardAreaCompact: {
    flexGrow: 0,
    flexShrink: 1,
    justifyContent: 'flex-start',
    paddingTop: 4,
  },
  keyboardArea: {
    flexShrink: 0,
    paddingTop: 8,
  },
  playButton: {
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 10,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playText: { fontSize: 18, fontWeight: '700' },
  pressed: { opacity: 0.85 },
});
