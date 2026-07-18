import { gridSizeForDifficulty } from './puzzleEngine';
import type { PersistedSnapGame, SnapDifficulty, SnapMode } from './types';

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
