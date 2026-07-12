export type SnapDifficulty = 'easy' | 'medium' | 'hard';
export type SnapMode = 'daily' | 'practice';
export type SnapStatus = 'idle' | 'loading' | 'playing' | 'won';

export const GRID_SIZE_BY_DIFFICULTY: Record<SnapDifficulty, number> = {
  easy: 4,
  medium: 6,
  hard: 8,
};

export interface Piece {
  id: string;
  originRow: number;
  originCol: number;
  slotRow: number;
  slotCol: number;
  groupId: string;
}

export interface PuzzleState {
  rows: number;
  cols: number;
  pieces: Piece[];
  imageSeed: string;
}

export interface PersistedSnapGame {
  mode: SnapMode;
  dateKey: string;
  difficulty: SnapDifficulty;
  rows: number;
  cols: number;
  pieces: Piece[];
  imageSeed: string;
  status: SnapStatus;
}

export interface GridLayout {
  pieceSize: number;
  gridWidth: number;
  gridHeight: number;
  originX: number;
  originY: number;
}

export interface GridSlot {
  row: number;
  col: number;
}
