import { create } from 'zustand';

import {
  applyDragTo,
  beginDragAt,
  createInitialState,
  recomputeState,
  resetBoard as resetBoardPaths,
  sanitizeSavedPaths,
} from '../core/flowEngine';
import { getDailyBoard, getPracticeBoard } from '../core/puzzleBank';
import { getLocalDateKey, getPracticeSeed } from '../core/dailyPuzzle';
import { shouldResumeSavedColorFlowGame } from '../core/sessionPolicy';
import type {
  FlowBoard,
  FlowDifficulty,
  FlowGameState,
  FlowMode,
  FlowStatus,
  PersistedFlowGame,
  Point,
} from '../core/types';
import { loadJson, removeKey, saveJson, storageKeys } from '../../../shared/services/storage';
import { useColorFlowSettingsStore } from './colorFlowSettingsStore';
import { useColorFlowStatsStore } from './colorFlowStatsStore';

interface ColorFlowGameState {
  status: FlowStatus;
  mode: FlowMode;
  difficulty: FlowDifficulty;
  dateKey: string;
  board: FlowBoard | null;
  gameState: FlowGameState | null;
  activeColorId: string | null;
  gameSessionId: number;
  dailyInProgress: boolean;
  practiceInProgress: boolean;
  elapsedSec: number;
  hydrateProgress: () => Promise<void>;
  resumeOrStartGame: (mode: FlowMode) => Promise<boolean>;
  startGame: (mode: FlowMode) => Promise<void>;
  setElapsedSec: (elapsedSec: number) => void;
  beginDrag: (point: Point) => string | null;
  extendDrag: (colorId: string, from: Point | null, to: Point) => void;
  commitDrag: () => void;
  resetBoard: () => void;
}

function storageKeyForMode(mode: FlowMode): string {
  return mode === 'daily' ? storageKeys.colorFlowSavedDaily : storageKeys.colorFlowSavedPractice;
}

function isValidSavedGame(saved: PersistedFlowGame | null): saved is PersistedFlowGame {
  return Boolean(saved && saved.board && saved.board.pairs.length > 0);
}

async function refreshProgressFlags(set: (partial: Partial<ColorFlowGameState>) => void): Promise<void> {
  const [dailyInProgress, practiceInProgress] = await Promise.all([
    loadJson<PersistedFlowGame>(storageKeys.colorFlowSavedDaily).then(
      (game) => isValidSavedGame(game) && game.status === 'playing',
    ),
    loadJson<PersistedFlowGame>(storageKeys.colorFlowSavedPractice).then(
      (game) => isValidSavedGame(game) && game.status === 'playing',
    ),
  ]);
  set({ dailyInProgress: Boolean(dailyInProgress), practiceInProgress: Boolean(practiceInProgress) });
}

async function persistIfPlaying(state: ColorFlowGameState): Promise<void> {
  if (!state.board || !state.gameState || state.status !== 'playing') {
    return;
  }

  const snapshot: PersistedFlowGame = {
    mode: state.mode,
    dateKey: state.dateKey,
    difficulty: state.difficulty,
    board: state.board,
    paths: state.gameState.paths,
    status: state.status,
    elapsedSec: state.elapsedSec,
    activeColorId: state.activeColorId,
  };

  await saveJson(storageKeyForMode(state.mode), snapshot);
}

export const useColorFlowStore = create<ColorFlowGameState>((set, get) => ({
  status: 'idle',
  mode: 'practice',
  difficulty: 'easy',
  dateKey: '',
  board: null,
  gameState: null,
  activeColorId: null,
  gameSessionId: 0,
  dailyInProgress: false,
  practiceInProgress: false,
  elapsedSec: 0,

  hydrateProgress: async () => {
    await refreshProgressFlags(set);
  },

  resumeOrStartGame: async (mode) => {
    await useColorFlowSettingsStore.getState().ensureHydrated();
    const selectedDifficulty = useColorFlowSettingsStore.getState().difficulty;
    const todayDateKey = getLocalDateKey();

    if (mode === 'daily' && useColorFlowStatsStore.getState().isDailyCompleteToday()) {
      const saved = await loadJson<PersistedFlowGame>(storageKeys.colorFlowSavedDaily);
      if (!isValidSavedGame(saved) || saved.status !== 'playing') {
        return false;
      }
    }

    const saved = await loadJson<PersistedFlowGame>(storageKeyForMode(mode));
    if (isValidSavedGame(saved) && saved.status === 'playing') {
      if (
        shouldResumeSavedColorFlowGame({
          saved,
          mode,
          selectedDifficulty,
          todayDateKey,
        })
      ) {
        const gameState = recomputeFromSaved(saved);
        set({
          status: 'playing',
          mode,
          difficulty: saved.difficulty,
          dateKey: saved.dateKey,
          board: saved.board,
          gameState,
          activeColorId: saved.activeColorId,
          gameSessionId: get().gameSessionId + 1,
          elapsedSec: saved.elapsedSec ?? 0,
        });
        await refreshProgressFlags(set);
        return true;
      }

      await removeKey(storageKeyForMode(mode));
    } else if (saved) {
      await removeKey(storageKeyForMode(mode));
    }

    if (mode === 'daily' && useColorFlowStatsStore.getState().isDailyCompleteToday()) {
      return false;
    }

    await get().startGame(mode);
    return true;
  },

  startGame: async (mode) => {
    await useColorFlowSettingsStore.getState().ensureHydrated();
    const difficulty = useColorFlowSettingsStore.getState().difficulty;

    await removeKey(storageKeyForMode(mode));
    const dateKey = mode === 'daily' ? getLocalDateKey() : '';
    const board =
      mode === 'daily'
        ? getDailyBoard(dateKey, difficulty)
        : getPracticeBoard(getPracticeSeed(), difficulty);
    const gameState = createInitialState(board);

    set({
      status: 'playing',
      mode,
      difficulty,
      dateKey,
      board,
      gameState,
      activeColorId: null,
      gameSessionId: get().gameSessionId + 1,
      elapsedSec: 0,
    });

    await persistIfPlaying(get());
    await refreshProgressFlags(set);
  },

  setElapsedSec: (elapsedSec) => set({ elapsedSec }),

  beginDrag: (point) => {
    const state = get();
    if (!state.board || !state.gameState || state.status !== 'playing') {
      return null;
    }

    const { state: nextGameState, colorId } = beginDragAt(state.gameState, point);
    if (!colorId) {
      return null;
    }

    if (nextGameState !== state.gameState || state.activeColorId !== colorId) {
      set({ gameState: nextGameState, activeColorId: colorId });
    }
    return colorId;
  },

  extendDrag: (colorId, from, to) => {
    const state = get();
    if (!state.board || !state.gameState || state.status !== 'playing') {
      return;
    }

    const nextGameState = applyDragTo(state.gameState, colorId, from, to);
    // Pan fires per pixel; a rejected step returns the same object, so skip the render.
    if (nextGameState === state.gameState && state.activeColorId === colorId) {
      return;
    }

    const solved = nextGameState.isComplete;
    set({
      gameState: nextGameState,
      activeColorId: colorId,
      status: solved ? 'won' : 'playing',
    });

    if (solved) {
      void finishSolvedGame(get, set, state.mode, state.difficulty);
    }
  },

  commitDrag: () => {
    const state = get();
    if (state.status !== 'playing') {
      return;
    }
    void persistIfPlaying(state);
  },

  resetBoard: () => {
    const state = get();
    if (!state.gameState || state.status !== 'playing') {
      return;
    }

    const nextGameState = resetBoardPaths(state.gameState);
    if (nextGameState === state.gameState) {
      return;
    }

    set({ gameState: nextGameState, activeColorId: null });
    void persistIfPlaying({ ...get(), gameState: nextGameState });
  },
}));

async function finishSolvedGame(
  get: () => ColorFlowGameState,
  set: (partial: Partial<ColorFlowGameState>) => void,
  mode: FlowMode,
  difficulty: FlowDifficulty,
): Promise<void> {
  await removeKey(storageKeyForMode(mode));
  await refreshProgressFlags(set);
  const stats = useColorFlowStatsStore.getState();
  await stats.recordResult(difficulty, true, get().elapsedSec);
  if (mode === 'daily') {
    await stats.markDailyComplete();
  }
}

function recomputeFromSaved(saved: PersistedFlowGame): FlowGameState {
  return recomputeState({
    board: saved.board,
    paths: sanitizeSavedPaths(saved.board, saved.paths),
  });
}
