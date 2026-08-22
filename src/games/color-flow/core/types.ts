export type FlowDifficulty = 'easy' | 'medium' | 'hard';
export type FlowMode = 'daily' | 'practice' | 'campaign';
export type FlowStatus = 'idle' | 'loading' | 'playing' | 'won' | 'lost';

export interface LevelSpec {
  gridSize: number;
  pairCount: number;
  timeLimitSec: number;
}

export const GRID_SIZE_BY_DIFFICULTY: Record<FlowDifficulty, number> = {
  easy: 4,
  medium: 6,
  hard: 8,
};

export const PAIR_COUNT_BY_DIFFICULTY: Record<FlowDifficulty, number> = {
  easy: 3,
  medium: 4,
  hard: 5,
};

export interface Point {
  r: number;
  c: number;
}

export interface ColorPair {
  id: string;
  colorHex: string;
  p1: Point;
  p2: Point;
}

export interface FlowBoard {
  rows: number;
  cols: number;
  pairs: ColorPair[];
}

export type PathState = Record<string, Point[]>;

export interface FlowGameState {
  board: FlowBoard;
  paths: PathState;
  isComplete: boolean;
  coveragePercent: number;
}

export interface PersistedFlowGame {
  mode: FlowMode;
  dateKey: string;
  difficulty: FlowDifficulty;
  board: FlowBoard;
  paths: PathState;
  status: FlowStatus;
  elapsedSec: number;
  activeColorId: string | null;
  seasonId?: string;
  level?: number;
  levelSpec?: LevelSpec;
  timeLimitSec?: number;
}
