import { create } from 'zustand';

import { getDailyImageSeed, getLocalDateKey, getPracticeImageSeed } from '../core/dailyPuzzle';
import {
  applyDragToSlot,
  createPuzzle,
  isSolved,
  isValidPersistedPiece,
  recomputeGroups,
  targetSlotFromDrag,
} from '../core/puzzleEngine';
import { shouldResumeSavedGridSnapGame } from '../core/sessionPolicy';
import { IS_TEST_MODE, TEST_IMAGE_SENTINEL } from '../core/testMode';
import type { GridLayout, PersistedSnapGame, PuzzleState, SnapDifficulty, SnapMode, SnapStatus } from '../core/types';
import { fetchPuzzleImage } from '../services/imageService';
import { loadJson, removeKey, saveJson, storageKeys } from '../../../shared/services/storage';
import { useGridSnapSettingsStore } from './gridSnapSettingsStore';
import { useGridSnapStatsStore } from './gridSnapStatsStore';

interface GridSnapGameState {
  status: SnapStatus;
  mode: SnapMode;
  difficulty: SnapDifficulty;
  dateKey: string;
  puzzle: PuzzleState | null;
  imageUrl: string | null;
  pieceSize: number;
  gridWidth: number;
  gridHeight: number;
  gridOriginX: number;
  gridOriginY: number;
  gameSessionId: number;
  dailyInProgress: boolean;
  practiceInProgress: boolean;
  hydrateProgress: () => Promise<void>;
  resumeOrStartGame: (mode: SnapMode) => Promise<boolean>;
  startGame: (mode: SnapMode) => Promise<void>;
  setGridLayout: (layout: GridLayout) => void;
  commitDrag: (pieceId: string, dx: number, dy: number) => void;
}

async function resolveImageUrl(seed: string): Promise<string> {
  if (IS_TEST_MODE) {
    return TEST_IMAGE_SENTINEL;
  }
  const image = await fetchPuzzleImage(seed);
  return image.url;
}

function storageKeyForMode(mode: SnapMode): string {
  return mode === 'daily' ? storageKeys.gridSnapSavedDaily : storageKeys.gridSnapSavedPractice;
}

function isValidSavedGame(saved: PersistedSnapGame | null): saved is PersistedSnapGame {
  return Boolean(saved && saved.pieces.every(isValidPersistedPiece));
}

async function refreshProgressFlags(set: (partial: Partial<GridSnapGameState>) => void): Promise<void> {
  const [dailyInProgress, practiceInProgress] = await Promise.all([
    loadJson<PersistedSnapGame>(storageKeys.gridSnapSavedDaily).then(
      (game) => isValidSavedGame(game) && game.status === 'playing',
    ),
    loadJson<PersistedSnapGame>(storageKeys.gridSnapSavedPractice).then(
      (game) => isValidSavedGame(game) && game.status === 'playing',
    ),
  ]);
  set({ dailyInProgress: Boolean(dailyInProgress), practiceInProgress: Boolean(practiceInProgress) });
}

async function persistIfPlaying(state: GridSnapGameState): Promise<void> {
  if (!state.puzzle || state.status !== 'playing') {
    return;
  }

  const snapshot: PersistedSnapGame = {
    mode: state.mode,
    dateKey: state.dateKey,
    difficulty: state.difficulty,
    rows: state.puzzle.rows,
    cols: state.puzzle.cols,
    pieces: state.puzzle.pieces,
    imageSeed: state.puzzle.imageSeed,
    status: state.status,
  };

  await saveJson(storageKeyForMode(state.mode), snapshot);
}

export const useGridSnapStore = create<GridSnapGameState>((set, get) => ({
  status: 'idle',
  mode: 'practice',
  difficulty: 'easy',
  dateKey: '',
  puzzle: null,
  imageUrl: null,
  pieceSize: 0,
  gridWidth: 0,
  gridHeight: 0,
  gridOriginX: 0,
  gridOriginY: 0,
  gameSessionId: 0,
  dailyInProgress: false,
  practiceInProgress: false,

  hydrateProgress: async () => {
    await refreshProgressFlags(set);
  },

  resumeOrStartGame: async (mode) => {
    await useGridSnapSettingsStore.getState().ensureHydrated();
    const selectedDifficulty = useGridSnapSettingsStore.getState().difficulty;
    const todayDateKey = getLocalDateKey();

    if (mode === 'daily' && useGridSnapStatsStore.getState().isDailyCompleteToday()) {
      const saved = await loadJson<PersistedSnapGame>(storageKeys.gridSnapSavedDaily);
      if (!isValidSavedGame(saved) || saved.status !== 'playing') {
        return false;
      }
    }

    const saved = await loadJson<PersistedSnapGame>(storageKeyForMode(mode));
    if (isValidSavedGame(saved) && saved.status === 'playing') {
      if (
        shouldResumeSavedGridSnapGame({
          saved,
          mode,
          selectedDifficulty,
          todayDateKey,
        })
      ) {
        const imageUrl = await resolveImageUrl(saved.imageSeed);
        set({
          status: 'playing',
          mode,
          difficulty: saved.difficulty,
          dateKey: saved.dateKey,
          gameSessionId: get().gameSessionId + 1,
          puzzle: {
            rows: saved.rows,
            cols: saved.cols,
            pieces: recomputeGroups(saved.pieces, saved.cols),
            imageSeed: saved.imageSeed,
          },
          imageUrl,
        });
        await refreshProgressFlags(set);
        return true;
      }

      await removeKey(storageKeyForMode(mode));
    } else if (saved) {
      await removeKey(storageKeyForMode(mode));
    }

    if (mode === 'daily' && useGridSnapStatsStore.getState().isDailyCompleteToday()) {
      return false;
    }

    await get().startGame(mode);
    return true;
  },

  startGame: async (mode) => {
    await useGridSnapSettingsStore.getState().ensureHydrated();
    const difficulty = useGridSnapSettingsStore.getState().difficulty;

    await removeKey(storageKeyForMode(mode));
    const dateKey = mode === 'daily' ? getLocalDateKey() : '';
    const imageSeed = mode === 'daily' ? getDailyImageSeed() : getPracticeImageSeed();

    set({
      status: 'loading',
      mode,
      difficulty,
      dateKey,
      puzzle: null,
      imageUrl: null,
      gameSessionId: get().gameSessionId + 1,
      pieceSize: 0,
      gridWidth: 0,
      gridHeight: 0,
    });

    const imageUrl = await resolveImageUrl(imageSeed);
    const puzzle = createPuzzle(difficulty, imageSeed);

    set({
      status: 'playing',
      puzzle,
      imageUrl,
    });

    await persistIfPlaying(get());
    await refreshProgressFlags(set);
  },

  setGridLayout: (layout) => {
    const current = get();
    if (
      current.pieceSize === layout.pieceSize &&
      current.gridWidth === layout.gridWidth &&
      current.gridHeight === layout.gridHeight &&
      current.gridOriginX === layout.originX &&
      current.gridOriginY === layout.originY
    ) {
      return;
    }

    set({
      pieceSize: layout.pieceSize,
      gridWidth: layout.gridWidth,
      gridHeight: layout.gridHeight,
      gridOriginX: layout.originX,
      gridOriginY: layout.originY,
    });
  },

  commitDrag: (pieceId, dx, dy) => {
    const state = get();
    if (!state.puzzle || state.status !== 'playing' || state.pieceSize <= 0) {
      return;
    }

    const dragged = state.puzzle.pieces.find((piece) => piece.id === pieceId);
    if (!dragged) {
      return;
    }

    const targetSlot = targetSlotFromDrag(
      dragged,
      dx,
      dy,
      state.pieceSize,
      state.puzzle.rows,
      state.puzzle.cols,
    );

    const movedPieces = applyDragToSlot(
      state.puzzle.pieces,
      pieceId,
      targetSlot,
      state.puzzle.rows,
    );

    const puzzle: PuzzleState = {
      ...state.puzzle,
      pieces: recomputeGroups(movedPieces, state.puzzle.cols),
    };

    const solved = isSolved(puzzle);

    set({
      puzzle,
      status: solved ? 'won' : 'playing',
    });

    void (async () => {
      if (solved) {
        await removeKey(storageKeyForMode(state.mode));
        await refreshProgressFlags(set);
        const stats = useGridSnapStatsStore.getState();
        await stats.recordResult(true);
        if (state.mode === 'daily') {
          await stats.markDailyComplete();
        }
        return;
      }

      await persistIfPlaying({ ...get(), puzzle, status: 'playing' });
      await refreshProgressFlags(set);
    })();
  },
}));
