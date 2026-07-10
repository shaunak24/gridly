import { create } from 'zustand';

import { getDailyWord, getLocalDateKey } from '../core/dailyWord';
import {
  isValidGuess,
  mergeLetterStates,
  pickRandomWord,
  scoreGuess,
} from '../core/gameEngine';
import { violatesHardMode } from '../core/hardMode';
import type { GameMode, GameStatus, GuessRow, TileState } from '../core/types';
import { MAX_GUESSES, WORD_LENGTH } from '../core/types';
import { wordLists } from '../core/wordLists';
import {
  clearPersistedGame,
  loadPersistedGame,
  savePersistedGame,
  toPersistedGame,
} from './gamePersistence';
import { useSettingsStore } from './settingsStore';
import { useStatsStore } from './statsStore';

interface GameState {
  status: GameStatus;
  mode: GameMode;
  dateKey: string;
  secretWord: string;
  guesses: GuessRow[];
  currentGuess: string;
  currentRowIndex: number;
  letterStates: Record<string, 'default' | 'correct' | 'present' | 'absent'>;
  errorMessage: string | null;
  shakeRow: boolean;
  dailyInProgress: boolean;
  practiceInProgress: boolean;
  hydrateProgress: () => Promise<void>;
  resumeOrStartGame: (mode: GameMode, options?: { secretWord?: string }) => Promise<boolean>;
  startGame: (mode: GameMode, options?: { secretWord?: string }) => void;
  appendLetter: (letter: string) => void;
  removeLetter: () => void;
  submitGuess: () => boolean;
  clearError: () => void;
  clearShake: () => void;
}

function emptyRow(): GuessRow {
  return {
    letters: Array(WORD_LENGTH).fill(''),
    states: Array(WORD_LENGTH).fill('empty') as TileState[],
  };
}

function createEmptyBoard(): GuessRow[] {
  return Array.from({ length: MAX_GUESSES }, emptyRow);
}

function pickSecret(mode: GameMode, customWord?: string): string {
  if (mode === 'custom' && customWord) {
    return customWord.toUpperCase();
  }
  if (mode === 'daily') {
    return getDailyWord(new Date(), wordLists.answers);
  }
  return pickRandomWord(wordLists.answers);
}

function isInMemoryGameResumable(state: GameState, mode: GameMode): boolean {
  if (state.status !== 'playing' || state.mode !== mode || !state.secretWord) {
    return false;
  }

  if (mode === 'daily' && state.dateKey !== getLocalDateKey()) {
    return false;
  }

  return true;
}

async function persistIfPlaying(state: GameState): Promise<void> {
  if (state.mode === 'custom') {
    return;
  }

  const snapshot = toPersistedGame(state);
  if (snapshot) {
    await savePersistedGame(snapshot);
    return;
  }

  if (state.mode) {
    await clearPersistedGame(state.mode);
  }
}

async function refreshProgressFlags(set: (partial: Partial<GameState>) => void): Promise<void> {
  const [dailyInProgress, practiceInProgress] = await Promise.all([
    loadPersistedGame('daily').then((g) => g !== null),
    loadPersistedGame('practice').then((g) => g !== null),
  ]);
  set({ dailyInProgress, practiceInProgress });
}

export const useGameStore = create<GameState>((set, get) => ({
  status: 'idle',
  mode: 'practice',
  dateKey: '',
  secretWord: '',
  guesses: createEmptyBoard(),
  currentGuess: '',
  currentRowIndex: 0,
  letterStates: {},
  errorMessage: null,
  shakeRow: false,
  dailyInProgress: false,
  practiceInProgress: false,

  hydrateProgress: async () => {
    await refreshProgressFlags(set);
  },

  resumeOrStartGame: async (mode, options) => {
    if (mode === 'daily' && useStatsStore.getState().isDailyCompleteToday()) {
      const saved = await loadPersistedGame('daily');
      if (!saved) {
        return false;
      }
    }

    const current = get();

    if (mode === 'custom' && options?.secretWord) {
      get().startGame('custom', options);
      return true;
    }

    if (isInMemoryGameResumable(current, mode)) {
      return true;
    }

    const saved = await loadPersistedGame(mode);
    if (saved) {
      set({
        status: saved.status,
        mode: saved.mode,
        dateKey: saved.dateKey,
        secretWord: saved.secretWord,
        guesses: saved.guesses,
        currentGuess: saved.currentGuess,
        currentRowIndex: saved.currentRowIndex,
        letterStates: saved.letterStates,
        errorMessage: null,
        shakeRow: false,
      });
      await refreshProgressFlags(set);
      return true;
    }

    if (mode === 'daily' && useStatsStore.getState().isDailyCompleteToday()) {
      return false;
    }

    get().startGame(mode, options);
    return true;
  },

  startGame: (mode, options) => {
    const dateKey = mode === 'daily' ? getLocalDateKey() : '';
    set({
      status: 'playing',
      mode,
      dateKey,
      secretWord: pickSecret(mode, options?.secretWord),
      guesses: createEmptyBoard(),
      currentGuess: '',
      currentRowIndex: 0,
      letterStates: {},
      errorMessage: null,
      shakeRow: false,
    });

    void (async () => {
      if (mode !== 'custom') {
        await clearPersistedGame(mode);
      }
      const next = get();
      if (mode !== 'custom') {
        await persistIfPlaying(next);
      }
      await refreshProgressFlags(set);
    })();
  },

  appendLetter: (letter) => {
    const { status, currentGuess } = get();
    if (status !== 'playing' || currentGuess.length >= WORD_LENGTH) {
      return;
    }

    set({
      currentGuess: `${currentGuess}${letter.toUpperCase()}`,
      errorMessage: null,
    });
    void persistIfPlaying(get());
  },

  removeLetter: () => {
    const { status, currentGuess } = get();
    if (status !== 'playing' || currentGuess.length === 0) {
      return;
    }

    set({
      currentGuess: currentGuess.slice(0, -1),
      errorMessage: null,
    });
    void persistIfPlaying(get());
  },

  submitGuess: () => {
    const state = get();
    if (state.status !== 'playing') {
      return false;
    }

    if (state.currentGuess.length !== WORD_LENGTH) {
      return false;
    }

    if (!isValidGuess(state.currentGuess, wordLists.allowedGuessSet)) {
      set({ errorMessage: 'Not in word list', shakeRow: true });
      return false;
    }

    const hardMode = useSettingsStore.getState().hardMode;
    if (hardMode && violatesHardMode(state.currentGuess, state.guesses, state.currentRowIndex)) {
      set({ errorMessage: 'Must use all hints (hard mode)', shakeRow: true });
      return false;
    }

    const scored = scoreGuess(state.secretWord, state.currentGuess);
    const rowIndex = state.currentRowIndex;
    const nextGuesses = state.guesses.map((row, index) => {
      if (index !== rowIndex) {
        return row;
      }

      return {
        letters: state.currentGuess.split(''),
        states: scored.map((tile) => tile.state) as TileState[],
      };
    });

    const isWin = state.currentGuess.toUpperCase() === state.secretWord.toUpperCase();
    const nextRowIndex = rowIndex + 1;
    const isLoss = !isWin && nextRowIndex >= MAX_GUESSES;

    set({
      guesses: nextGuesses,
      currentGuess: '',
      currentRowIndex: nextRowIndex,
      letterStates: mergeLetterStates(state.letterStates, scored),
      status: isWin ? 'won' : isLoss ? 'lost' : 'playing',
      errorMessage: null,
      shakeRow: false,
    });

    const next = get();
    if (isWin || isLoss) {
      if (state.mode !== 'custom') {
        void clearPersistedGame(state.mode);
      }
      void refreshProgressFlags(set);
      if (state.mode !== 'custom') {
        const stats = useStatsStore.getState();
        void stats.recordResult(isWin, isWin ? rowIndex + 1 : 0);
        if (state.mode === 'daily') {
          void stats.markDailyComplete();
        }
      }
    } else {
      void persistIfPlaying(next);
      void refreshProgressFlags(set);
    }

    return true;
  },

  clearError: () => set({ errorMessage: null }),
  clearShake: () => set({ shakeRow: false }),
}));
