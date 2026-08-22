import type { FlowDifficulty, FlowMode, FlowStatus, LevelSpec, PersistedFlowGame, FlowBoard } from './types';
import { GRID_SIZE_BY_DIFFICULTY } from './types';

function gridSizeForDifficulty(difficulty: FlowDifficulty): number {
  return GRID_SIZE_BY_DIFFICULTY[difficulty];
}

export function shouldResumeSavedColorFlowGame(params: {
  saved: PersistedFlowGame;
  mode: FlowMode;
  selectedDifficulty: FlowDifficulty;
  todayDateKey: string;
  campaignSeasonId?: string;
  campaignLevel?: number;
}): boolean {
  const { saved, mode, selectedDifficulty, todayDateKey, campaignSeasonId, campaignLevel } = params;

  if (saved.status !== 'playing') {
    return false;
  }

  if (mode === 'campaign') {
    if (
      saved.mode !== 'campaign' ||
      saved.seasonId !== campaignSeasonId ||
      saved.level !== campaignLevel
    ) {
      return false;
    }
    return true;
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
    seasonId?: string;
    level?: number;
  },
  mode: FlowMode,
  selectedDifficulty: FlowDifficulty,
  todayDateKey: string,
  campaignSeasonId?: string,
  campaignLevel?: number,
): boolean {
  if (state.status !== 'playing' || state.mode !== mode || !state.board) {
    return false;
  }

  if (mode === 'campaign') {
    return state.seasonId === campaignSeasonId && state.level === campaignLevel;
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

export function savedLevelSpecMatches(saved: PersistedFlowGame, spec: LevelSpec): boolean {
  if (!saved.levelSpec) {
    return saved.board.rows === spec.gridSize && saved.board.pairs.length === spec.pairCount;
  }
  return (
    saved.levelSpec.gridSize === spec.gridSize &&
    saved.levelSpec.pairCount === spec.pairCount &&
    saved.levelSpec.timeLimitSec === spec.timeLimitSec
  );
}
