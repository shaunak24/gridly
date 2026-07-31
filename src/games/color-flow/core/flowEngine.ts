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

/**
 * Random Hamiltonian path over the whole grid.
 *
 * A boustrophedon ("snake") ordering is always a valid Hamiltonian path, and
 * "backbite" moves shuffle it into an unpredictable one in linear time: take an end
 * of the path, pick a random grid-neighbour of it, and reverse the run between them.
 * Every intermediate state is still a Hamiltonian path, so this cannot fail.
 *
 * The previous implementation searched with DFS + backtracking, which is exponential
 * in the worst case — 8x8 boards took seconds each and froze the app.
 */
function buildHamiltonianPath(rows: number, cols: number, rng: () => number): Point[] {
  const total = rows * cols;
  const path: Point[] = [];
  for (let r = 0; r < rows; r += 1) {
    if (r % 2 === 0) {
      for (let c = 0; c < cols; c += 1) {
        path.push({ r, c });
      }
    } else {
      for (let c = cols - 1; c >= 0; c -= 1) {
        path.push({ r, c });
      }
    }
  }

  const positionOf = new Map<string, number>();
  path.forEach((point, index) => positionOf.set(pointKey(point), index));

  const reverseRange = (from: number, to: number) => {
    let low = from;
    let high = to;
    while (low < high) {
      const a = path[low];
      const b = path[high];
      path[low] = b;
      path[high] = a;
      positionOf.set(pointKey(b), low);
      positionOf.set(pointKey(a), high);
      low += 1;
      high -= 1;
    }
  };

  const iterations = total * 20;
  for (let i = 0; i < iterations; i += 1) {
    const fromHead = rng() < 0.5;
    const endIndex = fromHead ? 0 : total - 1;
    const options = neighbors(path[endIndex], rows, cols);
    const pick = options[Math.floor(rng() * options.length)];
    const pickIndex = positionOf.get(pointKey(pick));
    if (pickIndex === undefined) {
      continue;
    }

    if (fromHead) {
      if (pickIndex > 1) {
        reverseRange(0, pickIndex - 1);
      }
    } else if (pickIndex < total - 2) {
      reverseRange(pickIndex + 1, total - 1);
    }
  }

  return path;
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

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const rng = createRng(`${seed}:${attempt}`);
    const hamiltonian = buildHamiltonianPath(rows, cols, rng);
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

export function isPairConnected(pair: ColorPair, path: Point[]): boolean {
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

/**
 * Hand `point` to `activeColorId` by cutting every other path *before* the cell.
 * The crossed cell must end up owned by exactly one color, so the victim keeps
 * only the run that precedes it.
 */
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
      next[colorId] = path.slice(0, index);
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
    if (validated.length === 0) {
      if (!pointsEqual(point, pair.p1) && !pointsEqual(point, pair.p2)) {
        return state;
      }
    } else if (!isAdjacent(validated[validated.length - 1], point)) {
      return state;
    }
    validated.push(point);
    if (validated.length > 1 && isPairConnected(pair, validated)) {
      break;
    }
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

  // A connected pair is sealed: only backtracking (handled above) can reopen it.
  if (isPairConnected(pair, path)) {
    return state;
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

export function pathOwnerAt(paths: PathState, point: Point): string | null {
  for (const [colorId, path] of Object.entries(paths)) {
    if (findPointIndex(path, point) >= 0) {
      return colorId;
    }
  }
  return null;
}

export function filledCellCount(paths: PathState): number {
  const filled = new Set<string>();
  for (const path of Object.values(paths)) {
    for (const point of path) {
      filled.add(pointKey(point));
    }
  }
  return filled.size;
}

export function buildPathColorMap(board: FlowBoard, paths: PathState): Map<string, string> {
  const map = new Map<string, string>();
  for (const pair of board.pairs) {
    for (const point of paths[pair.id] ?? []) {
      map.set(pointKey(point), pair.colorHex);
    }
  }
  return map;
}

export function clearColor(state: FlowGameState, colorId: string): FlowGameState {
  if ((state.paths[colorId] ?? []).length === 0) {
    return state;
  }
  return recomputeState({ board: state.board, paths: clearPath(state.paths, colorId) });
}

export function resetBoard(state: FlowGameState): FlowGameState {
  if (filledCellCount(state.paths) === 0) {
    return state;
  }
  return createInitialState(state.board);
}

/**
 * Repair a persisted board. Earlier builds let a path grow past its second dot and
 * let two colors claim the same cell, so saves can be illegal; replay each path and
 * cut it at the first rule violation.
 */
export function sanitizeSavedPaths(board: FlowBoard, paths: PathState): PathState {
  const claimed = new Set<string>();
  const result: PathState = {};

  for (const pair of board.pairs) {
    const raw = paths[pair.id] ?? [];
    const clean: Point[] = [];

    for (const point of raw) {
      if (!isInBounds(point, board.rows, board.cols)) {
        break;
      }
      if (clean.length === 0) {
        if (!pointsEqual(point, pair.p1) && !pointsEqual(point, pair.p2)) {
          break;
        }
      } else if (!isAdjacent(clean[clean.length - 1], point)) {
        break;
      }
      if (findPointIndex(clean, point) >= 0) {
        break;
      }

      const key = pointKey(point);
      if (claimed.has(key)) {
        break;
      }
      const endpointOwner = getEndpointColor(board, point);
      if (endpointOwner && endpointOwner !== pair.id) {
        break;
      }

      clean.push(point);
      claimed.add(key);

      if (isPairConnected(pair, clean)) {
        break;
      }
    }

    result[pair.id] = clean;
  }

  return result;
}

export const MAX_INTERPOLATION_STEPS = 6;

/**
 * Candidate orthogonal routes from `from` (exclusive) to `to` (inclusive). Pan events
 * can skip cells on a fast drag, and a raw non-adjacent step would be rejected outright,
 * so the caller replays one of these chains instead. Diagonal moves yield both L shapes
 * because only one of them may be free of other paths.
 */
export function interpolateCells(from: Point, to: Point): Point[][] {
  const dr = to.r - from.r;
  const dc = to.c - from.c;
  const distance = Math.abs(dr) + Math.abs(dc);
  if (distance === 0 || distance > MAX_INTERPOLATION_STEPS) {
    return [];
  }

  const stepR = Math.sign(dr);
  const stepC = Math.sign(dc);

  const rowFirst: Point[] = [];
  for (let r = from.r; r !== to.r; ) {
    r += stepR;
    rowFirst.push({ r, c: from.c });
  }
  for (let c = from.c; c !== to.c; ) {
    c += stepC;
    rowFirst.push({ r: to.r, c });
  }

  if (dr === 0 || dc === 0) {
    return [rowFirst];
  }

  const colFirst: Point[] = [];
  for (let c = from.c; c !== to.c; ) {
    c += stepC;
    colFirst.push({ r: from.r, c });
  }
  for (let r = from.r; r !== to.r; ) {
    r += stepR;
    colFirst.push({ r, c: to.c });
  }

  return [rowFirst, colFirst];
}

function applyChain(
  state: FlowGameState,
  colorId: string,
  points: Point[],
): { state: FlowGameState; applied: number } {
  let current = state;
  let applied = 0;
  for (const point of points) {
    const next = applyPathStep(current, colorId, point);
    if (next === current) {
      break;
    }
    current = next;
    applied += 1;
  }
  return { state: current, applied };
}

export function applyPathSteps(
  state: FlowGameState,
  colorId: string,
  points: Point[],
): FlowGameState {
  return applyChain(state, colorId, points).state;
}

/**
 * Move `colorId`'s path from the last committed cell to `to`, replaying whichever
 * interpolated route gets furthest.
 */
export function applyDragTo(
  state: FlowGameState,
  colorId: string,
  from: Point | null,
  to: Point,
): FlowGameState {
  if (!from) {
    return applyPathStep(state, colorId, to);
  }

  let best = state;
  let bestApplied = 0;

  for (const chain of interpolateCells(from, to)) {
    const result = applyChain(state, colorId, chain);
    if (result.applied === chain.length) {
      return result.state;
    }
    if (result.applied > bestApplied) {
      best = result.state;
      bestApplied = result.applied;
    }
  }

  return best;
}

export interface BeginResult {
  state: FlowGameState;
  colorId: string | null;
  cell: Point;
}

/**
 * Resolve what a touch-down means: grabbing a dot restarts that color, grabbing a
 * drawn cell adopts that color and trims to it, and anything else is inert so a
 * stray tap cannot scribble with whichever color happened to be active.
 */
export function beginDragAt(state: FlowGameState, point: Point): BeginResult {
  if (!isInBounds(point, state.board.rows, state.board.cols)) {
    return { state, colorId: null, cell: point };
  }

  const endpointColor = getEndpointColor(state.board, point);
  if (endpointColor) {
    const existing = state.paths[endpointColor] ?? [];
    const existingIndex = findPointIndex(existing, point);
    const paths = cutOtherPathsAtCell(state.paths, point, endpointColor);
    paths[endpointColor] = existingIndex >= 0 ? trimPathToIndex(existing, existingIndex) : [point];
    return {
      state: recomputeState({ board: state.board, paths }),
      colorId: endpointColor,
      cell: point,
    };
  }

  const owner = pathOwnerAt(state.paths, point);
  if (owner) {
    return { state: applyPathStep(state, owner, point), colorId: owner, cell: point };
  }

  return { state, colorId: null, cell: point };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function isInsideBoard(
  x: number,
  y: number,
  cellSize: number,
  rows: number,
  cols: number,
): boolean {
  if (cellSize <= 0) {
    return false;
  }
  return x >= 0 && y >= 0 && x < cols * cellSize && y < rows * cellSize;
}

function commitAxis(
  currentIndex: number,
  rawIndex: number,
  coord: number,
  cellSize: number,
  margin: number,
): number {
  if (rawIndex === currentIndex) {
    return currentIndex;
  }
  // Hysteresis only guards against flicker between neighbours; a real jump commits.
  if (Math.abs(rawIndex - currentIndex) > 1) {
    return rawIndex;
  }
  if (rawIndex > currentIndex) {
    return coord >= rawIndex * cellSize + margin ? rawIndex : currentIndex;
  }
  return coord <= (rawIndex + 1) * cellSize - margin ? rawIndex : currentIndex;
}

/**
 * Map a touch to a cell, clamped in bounds. `current` is the last committed cell;
 * the touch must cross `marginRatio` of a cell into a neighbour before it counts,
 * so a finger resting on a boundary does not flicker between two cells.
 */
export function resolveTouchCell(params: {
  x: number;
  y: number;
  cellSize: number;
  rows: number;
  cols: number;
  current: Point | null;
  marginRatio?: number;
}): Point {
  const { x, y, cellSize, rows, cols, current, marginRatio = 0.15 } = params;
  if (cellSize <= 0) {
    return current ?? { r: 0, c: 0 };
  }

  const rawC = clamp(Math.floor(x / cellSize), 0, cols - 1);
  const rawR = clamp(Math.floor(y / cellSize), 0, rows - 1);
  if (!current) {
    return { r: rawR, c: rawC };
  }

  const margin = cellSize * marginRatio;
  return {
    r: commitAxis(current.r, rawR, y, cellSize, margin),
    c: commitAxis(current.c, rawC, x, cellSize, margin),
  };
}
