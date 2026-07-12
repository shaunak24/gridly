import type { GameMode, GameStatus, GuessRow, LetterState } from './types';

export interface PersistedGame {
  mode: GameMode;
  dateKey: string;
  status: Extract<GameStatus, 'playing'>;
  secretWord: string;
  guesses: GuessRow[];
  currentGuess: string;
  currentRowIndex: number;
  letterStates: Record<string, LetterState>;
}

export function toPersistedGame(state: {
  mode: GameMode;
  dateKey: string;
  status: GameStatus;
  secretWord: string;
  guesses: GuessRow[];
  currentGuess: string;
  currentRowIndex: number;
  letterStates: Record<string, LetterState>;
}): PersistedGame | null {
  if (state.status !== 'playing' || !state.secretWord) {
    return null;
  }

  return {
    mode: state.mode,
    dateKey: state.dateKey,
    status: 'playing',
    secretWord: state.secretWord,
    guesses: state.guesses,
    currentGuess: state.currentGuess,
    currentRowIndex: state.currentRowIndex,
    letterStates: state.letterStates,
  };
}
