import { colorHexForIndex } from './colors';
import type {
  ColorPair,
  FlowBoard,
  FlowDifficulty,
  FlowGameState,
  PathState,
  Point,
} from './types';
import { GRID_SIZE_BY_DIFFICULTY, PAIR_COUNT_BY_DIFFICULTY } from './types';

export function pointKey(point: Point): string {
  return `${point.r},${point.c}`;
}

export function pointsEqual(a: Point, b: Point): boolean {
  return a.r === b.r && a.c === b.c;
}

export function isAdjacent(a: Point, b: Point): boolean {
  const dr = Math.abs(a.r - b.r);
  const dc = Math.abs(a.c - b.c);
  return dr + dc === 1;
}

function isInBounds(point: Point, rows: number, cols: number): boolean {
  return point.r >= 0 && point.r < rows && point.c >= 0 && point.c < cols;
}

function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
    hash ^= hash >>> 16;
    hash = Math.imul(hash, 0x7feb352d);
    hash ^= hash >>> 15;
  }
  return Math.abs(hash) || 1;
}

function createRng(seed: string): () => number {
  let state = hashSeed(seed);
  return () => {
    state = (state * 1103515245 + 12345) | 0;
    return (Math.abs(state) % 10_000) / 10_000;
  };
}

function neighbors(point: Point, rows: number, cols: number): Point[] {
  const candidates: Point[] = [
    { r: point.r - 1, c: point.c },
    { r: point.r + 1, c: point.c },
    { r: point.r, c: point.c - 1 },
    { r: point.r, c: point.c + 1 },
  ];
  return candidates.filter((candidate) => isInBounds(candidate, rows, cols));
}

function buildHamiltonianPath(rows: number, cols: number, rng: () => number): Point[] | null {
  const total = rows * cols;
  const startRow = Math.floor(rng() * rows);
  const startCol = Math.floor(rng() * cols);
  const visited = new Set<string>();
  const path: Point[] = [];

  function dfs(point: Point): boolean {
    const key = pointKey(point);
    if (visited.has(key)) {
      return false;
    }

    visited.add(key);
    path.push(point);

    if (path.length === total) {
      return true;
    }

    const options = neighbors(point, rows, cols)
      .filter((neighbor) => !visited.has(pointKey(neighbor)))
      .sort((a, b) => {
        const aOptions = neighbors(a, rows, cols).filter((n) => !visited.has(pointKey(n))).length;
        const bOptions = neighbors(b, rows, cols).filter((n) => !visited.has(pointKey(n))).length;
        if (aOptions !== bOptions) {
          return aOptions - bOptions;
        }
        return rng() - 0.5;
      });

    for (const next of options) {
      if (dfs(next)) {
        return true;
      }
    }

    visited.delete(key);
    path.pop();
    return false;
  }

  return dfs({ r: startRow, c: startCol }) ? path : null;
}

function splitHamiltonianPath(path: Point[], pairCount: number): Point[][] {
  const total = path.length;
  const minSegment = 2;
  if (total < pairCount * minSegment) {
    return [];
  }

  const segments: Point[][] = [];
  let start = 0;
  const remainingCells = total;
  const remainingPairs = pairCount;

  for (let pairIndex = 0; pairIndex < pairCount; pairIndex += 1) {
    const pairsLeft = pairCount - pairIndex;
    const cellsLeft = total - start;
    const minNeeded = (pairsLeft - 1) * minSegment;
    const maxLength = cellsLeft - minNeeded;
    const minLength = minSegment;
    const target = Math.max(minLength, Math.floor(cellsLeft / pairsLeft));
    const length = Math.min(maxLength, Math.max(minLength, target));
    segments.push(path.slice(start, start + length));
    start += length;
  }

  if (start !== total || segments.length !== pairCount) {
    return [];
  }

  return segments.every((segment) => segment.length >= minSegment) ? segments : [];
}

export function generateBoard(difficulty: FlowDifficulty, seed: string): FlowBoard {
  const rows = GRID_SIZE_BY_DIFFICULTY[difficulty];
  const cols = rows;
  const pairCount = PAIR_COUNT_BY_DIFFICULTY[difficulty];

  for (let attempt = 0; attempt < 40; attempt += 1) {
    const rng = createRng(`${seed}:${attempt}`);
    const hamiltonian = buildHamiltonianPath(rows, cols, rng);
    if (!hamiltonian) {
      continue;
    }

    const segments = splitHamiltonianPath(hamiltonian, pairCount);
    if (segments.length !== pairCount) {
      continue;
    }

    const pairs: ColorPair[] = segments.map((segment, index) => ({
      id: `color-${index}`,
      colorHex: colorHexForIndex(index),
      p1: segment[0],
      p2: segment[segment.length - 1],
    }));

    return { rows, cols, pairs };
  }

  return getCuratedFallbackBoard(difficulty);
}

function getCuratedFallbackBoard(difficulty: FlowDifficulty): FlowBoard {
  const rows = GRID_SIZE_BY_DIFFICULTY[difficulty];
  const pairCount = PAIR_COUNT_BY_DIFFICULTY[difficulty];
  const pairs: ColorPair[] = [];

  for (let index = 0; index < pairCount; index += 1) {
    const startRow = index;
    const startCol = 0;
    const endRow = rows - 1 - index;
    const endCol = rows - 1;
    pairs.push({
      id: `color-${index}`,
      colorHex: colorHexForIndex(index),
      p1: { r: startRow, c: startCol },
      p2: { r: endRow, c: endCol },
    });
  }

  return { rows, cols: rows, pairs };
}

export function createInitialState(board: FlowBoard): FlowGameState {
  const paths: PathState = {};
  for (const pair of board.pairs) {
    paths[pair.id] = [];
  }
  return recomputeState({ board, paths });
}

export function getPairById(board: FlowBoard, colorId: string): ColorPair | undefined {
  return board.pairs.find((pair) => pair.id === colorId);
}

export function getEndpointColor(board: FlowBoard, point: Point): string | null {
  for (const pair of board.pairs) {
    if (pointsEqual(pair.p1, point) || pointsEqual(pair.p2, point)) {
      return pair.id;
    }
  }
  return null;
}

function occupiedCells(paths: PathState, excludeColorId?: string): Map<string, string> {
  const map = new Map<string, string>();
  for (const [colorId, path] of Object.entries(paths)) {
    if (colorId === excludeColorId) {
      continue;
    }
    for (const point of path) {
      map.set(pointKey(point), colorId);
    }
  }
  return map;
}

function isPairConnected(pair: ColorPair, path: Point[]): boolean {
  if (path.length < 2) {
    return false;
  }
  const hasP1 = path.some((point) => pointsEqual(point, pair.p1));
  const hasP2 = path.some((point) => pointsEqual(point, pair.p2));
  return hasP1 && hasP2;
}

export function computeCoveragePercent(board: FlowBoard, paths: PathState): number {
  const totalCells = board.rows * board.cols;
  const filled = new Set<string>();
  for (const path of Object.values(paths)) {
    for (const point of path) {
      filled.add(pointKey(point));
    }
  }
  return Math.round((filled.size / totalCells) * 100);
}

export function checkWinCondition(state: FlowGameState): boolean {
  const { board, paths } = state;
  const totalCells = board.rows * board.cols;
  const filled = new Set<string>();

  for (const pair of board.pairs) {
    const path = paths[pair.id] ?? [];
    if (!isPairConnected(pair, path)) {
      return false;
    }
    for (const point of path) {
      filled.add(pointKey(point));
    }
  }

  return filled.size === totalCells;
}

export function recomputeState(state: { board: FlowBoard; paths: PathState }): FlowGameState {
  const coveragePercent = computeCoveragePercent(state.board, state.paths);
  const next: FlowGameState = {
    board: state.board,
    paths: state.paths,
    coveragePercent,
    isComplete: false,
  };
  next.isComplete = checkWinCondition(next);
  return next;
}

function trimPathToIndex(path: Point[], index: number): Point[] {
  return path.slice(0, index + 1);
}

function findPointIndex(path: Point[], point: Point): number {
  return path.findIndex((candidate) => pointsEqual(candidate, point));
}

export function clearPath(paths: PathState, colorId: string): PathState {
  return { ...paths, [colorId]: [] };
}

export function cutOtherPathsAtCell(
  paths: PathState,
  point: Point,
  activeColorId: string,
): PathState {
  const next: PathState = { ...paths };
  for (const [colorId, path] of Object.entries(paths)) {
    if (colorId === activeColorId) {
      continue;
    }
    const index = findPointIndex(path, point);
    if (index >= 0) {
      next[colorId] = trimPathToIndex(path, index);
    }
  }
  return next;
}

export function updatePath(
  state: FlowGameState,
  colorId: string,
  newPath: Point[],
): FlowGameState {
  const pair = getPairById(state.board, colorId);
  if (!pair) {
    return state;
  }

  const validated: Point[] = [];
  for (const point of newPath) {
    if (!isInBounds(point, state.board.rows, state.board.cols)) {
      return state;
    }
    if (validated.length > 0 && !isAdjacent(validated[validated.length - 1], point)) {
      return state;
    }
    validated.push(point);
  }

  const nextPaths = { ...state.paths, [colorId]: validated };
  return recomputeState({ board: state.board, paths: nextPaths });
}

export function applyPathStep(
  state: FlowGameState,
  colorId: string,
  point: Point,
): FlowGameState {
  const pair = getPairById(state.board, colorId);
  if (!pair || !isInBounds(point, state.board.rows, state.board.cols)) {
    return state;
  }

  let paths = { ...state.paths };
  let path = [...(paths[colorId] ?? [])];

  const endpointColor = getEndpointColor(state.board, point);
  if (endpointColor && endpointColor !== colorId) {
    return state;
  }

  const existingIndex = findPointIndex(path, point);
  if (existingIndex >= 0) {
    path = trimPathToIndex(path, existingIndex);
    paths = cutOtherPathsAtCell(paths, point, colorId);
    paths[colorId] = path;
    return recomputeState({ board: state.board, paths });
  }

  if (path.length === 0) {
    if (!pointsEqual(point, pair.p1) && !pointsEqual(point, pair.p2)) {
      return state;
    }
    path = [point];
    paths = cutOtherPathsAtCell(paths, point, colorId);
    paths[colorId] = path;
    return recomputeState({ board: state.board, paths });
  }

  const last = path[path.length - 1];
  if (!isAdjacent(last, point)) {
    return state;
  }

  const occupied = occupiedCells(paths, colorId);
  if (occupied.has(pointKey(point))) {
    paths = cutOtherPathsAtCell(paths, point, colorId);
  }

  path = [...path, point];
  paths[colorId] = path;
  return recomputeState({ board: state.board, paths });
}

export function connectedPairCount(board: FlowBoard, paths: PathState): number {
  return board.pairs.filter((pair) => isPairConnected(pair, paths[pair.id] ?? [])).length;
}
