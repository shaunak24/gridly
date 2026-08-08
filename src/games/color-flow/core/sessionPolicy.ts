import type { FlowDifficulty, FlowMode, FlowStatus, PersistedFlowGame, FlowBoard } from './types';
import { GRID_SIZE_BY_DIFFICULTY } from './types';

function gridSizeForDifficulty(difficulty: FlowDifficulty): number {
  return GRID_SIZE_BY_DIFFICULTY[difficulty];
}

export function shouldResumeSavedColorFlowGame(params: {
  saved: PersistedFlowGame;
  mode: FlowMode;
  selectedDifficulty: FlowDifficulty;
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
  if (saved.difficulty !== selectedDifficulty || saved.board.rows !== expectedSize) {
    return false;
  }

  return true;
}

export function isInMemoryColorFlowResumable(
  state: {
    status: FlowStatus;
    mode: FlowMode;
    dateKey: string;
    board: FlowBoard | null;
    difficulty: FlowDifficulty;
  },
  mode: FlowMode,
  selectedDifficulty: FlowDifficulty,
  todayDateKey: string,
): boolean {
  if (state.status !== 'playing' || state.mode !== mode || !state.board) {
    return false;
  }
  if (mode === 'daily' && state.dateKey !== todayDateKey) {
    return false;
  }
  const expectedSize = gridSizeForDifficulty(selectedDifficulty);
  if (state.difficulty !== selectedDifficulty || state.board.rows !== expectedSize) {
    return false;
  }
  return true;
}
