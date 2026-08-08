import { gridSizeForDifficulty } from './puzzleEngine';
import type { PersistedSnapGame, PuzzleState, SnapDifficulty, SnapMode, SnapStatus } from './types';

export function shouldResumeSavedGridSnapGame(params: {
  saved: PersistedSnapGame;
  mode: SnapMode;
  selectedDifficulty: SnapDifficulty;
  todayDateKey: string;
}): boolean {
  const { saved, mode, selectedDifficulty, todayDateKey } = params;

  if (saved.status !== 'playing') {
    return false;
  }

  if (mode === 'daily' && saved.dateKey !== todayDateKey) {
    return false;
  }

  const expectedSize = gridSizeForDifficulty(selectedDifficulty);
  if (saved.difficulty !== selectedDifficulty || saved.cols !== expectedSize) {
    return false;
  }

  return true;
}

export function isInMemoryGridSnapResumable(
  state: {
    status: SnapStatus;
    mode: SnapMode;
    dateKey: string;
    puzzle: PuzzleState | null;
    difficulty: SnapDifficulty;
  },
  mode: SnapMode,
  selectedDifficulty: SnapDifficulty,
  todayDateKey: string,
): boolean {
  if (state.status !== 'playing' || state.mode !== mode || !state.puzzle) {
    return false;
  }
  if (mode === 'daily' && state.dateKey !== todayDateKey) {
    return false;
  }
  const expectedSize = gridSizeForDifficulty(selectedDifficulty);
  if (state.difficulty !== selectedDifficulty || state.puzzle.cols !== expectedSize) {
    return false;
  }
  return true;
}
