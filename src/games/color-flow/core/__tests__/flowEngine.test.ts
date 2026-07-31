import {
  applyDragTo,
  applyPathStep,
  applyPathSteps,
  beginDragAt,
  buildPathColorMap,
  clearPath,
  computeCoveragePercent,
  connectedPairCount,
  createInitialState,
  filledCellCount,
  generateBoard,
  interpolateCells,
  isPairConnected,
  pointKey,
  recomputeState,
  resetBoard,
  resolveTouchCell,
  sanitizeSavedPaths,
  updatePath,
} from '../flowEngine';
import type { ColorPair, FlowBoard, PathState, Point } from '../types';

/**
 * Hand-built boards keep expectations exact. Generated boards vary by seed, so any
 * assertion written against one has to be loose enough to be meaningless.
 */
function makeBoard(rows: number, cols: number, pairs: { p1: Point; p2: Point }[]): FlowBoard {
  return {
    rows,
    cols,
    pairs: pairs.map<ColorPair>((pair, index) => ({
      id: `color-${index}`,
      colorHex: `#00000${index}`,
      p1: pair.p1,
      p2: pair.p2,
    })),
  };
}

/** 3x3 with one pair along the top row and one along the bottom row. */
function twoPairBoard(): FlowBoard {
  return makeBoard(3, 3, [
    { p1: { r: 0, c: 0 }, p2: { r: 0, c: 2 } },
    { p1: { r: 2, c: 0 }, p2: { r: 2, c: 2 } },
  ]);
}

function drawPath(board: FlowBoard, colorId: string, cells: Point[]) {
  return applyPathSteps(createInitialState(board), colorId, cells);
}

function allCellKeys(paths: PathState): string[] {
  return Object.values(paths).flatMap((path) => path.map(pointKey));
}

describe('board generation', () => {
  it('generates a board with the expected grid size and pair count', () => {
    const board = generateBoard('easy', 'test-seed');
    expect(board.rows).toBe(4);
    expect(board.cols).toBe(4);
    expect(board.pairs).toHaveLength(3);
  });

  it('starts with empty paths and zero coverage', () => {
    const state = createInitialState(generateBoard('easy', 'coverage-test'));
    expect(state.coveragePercent).toBe(0);
    expect(state.isComplete).toBe(false);
  });

  it.each(['easy', 'medium', 'hard'] as const)(
    'generates %s boards with distinct in-bounds endpoints',
    (difficulty) => {
      for (let i = 0; i < 10; i += 1) {
        const board = generateBoard(difficulty, `endpoint-${difficulty}-${i}`);
        const seen = new Set<string>();
        for (const pair of board.pairs) {
          for (const point of [pair.p1, pair.p2]) {
            expect(point.r).toBeGreaterThanOrEqual(0);
            expect(point.r).toBeLessThan(board.rows);
            expect(point.c).toBeGreaterThanOrEqual(0);
            expect(point.c).toBeLessThan(board.cols);
            expect(seen.has(pointKey(point))).toBe(false);
            seen.add(pointKey(point));
          }
        }
      }
    },
  );

  // Generation runs synchronously on the JS thread when a game starts. The old
  // backtracking search took seconds per 8x8 board and froze hard mode.
  it('generates hard boards fast enough to stay on the JS thread', () => {
    const started = Date.now();
    for (let i = 0; i < 25; i += 1) {
      generateBoard('hard', `perf-hard-${i}`);
    }
    expect(Date.now() - started).toBeLessThan(500);
  });
});

describe('applyPathStep', () => {
  const board = twoPairBoard();

  it('extends a path from an endpoint orthogonally', () => {
    const state = drawPath(board, 'color-0', [
      { r: 0, c: 0 },
      { r: 0, c: 1 },
    ]);
    expect(state.paths['color-0']).toEqual([
      { r: 0, c: 0 },
      { r: 0, c: 1 },
    ]);
  });

  it('refuses to start anywhere but an endpoint', () => {
    const initial = createInitialState(board);
    expect(applyPathStep(initial, 'color-0', { r: 1, c: 1 })).toBe(initial);
  });

  it('refuses a non-adjacent step', () => {
    const state = drawPath(board, 'color-0', [{ r: 0, c: 0 }]);
    expect(applyPathStep(state, 'color-0', { r: 2, c: 2 })).toBe(state);
  });

  it('backtracks when dragging back along the same path', () => {
    const state = drawPath(board, 'color-0', [
      { r: 0, c: 0 },
      { r: 0, c: 1 },
      { r: 0, c: 0 },
    ]);
    expect(state.paths['color-0']).toEqual([{ r: 0, c: 0 }]);
  });
});

describe('completion guard', () => {
  const board = twoPairBoard();
  const topRow: Point[] = [
    { r: 0, c: 0 },
    { r: 0, c: 1 },
    { r: 0, c: 2 },
  ];

  it('marks the pair connected on reaching the second dot', () => {
    const state = drawPath(board, 'color-0', topRow);
    expect(isPairConnected(board.pairs[0], state.paths['color-0'])).toBe(true);
  });

  it('refuses to extend past the second dot', () => {
    const state = drawPath(board, 'color-0', topRow);
    expect(applyPathStep(state, 'color-0', { r: 1, c: 2 })).toBe(state);
    expect(state.paths['color-0']).toHaveLength(3);
  });

  it('reopens the path after backtracking off the second dot', () => {
    let state = drawPath(board, 'color-0', topRow);
    state = applyPathStep(state, 'color-0', { r: 0, c: 1 });
    expect(state.paths['color-0']).toHaveLength(2);

    state = applyPathStep(state, 'color-0', { r: 1, c: 1 });
    expect(state.paths['color-0']).toHaveLength(3);
  });

  it('trims to an interior cell of a completed path', () => {
    let state = drawPath(board, 'color-0', topRow);
    state = applyPathStep(state, 'color-0', { r: 0, c: 0 });
    expect(state.paths['color-0']).toEqual([{ r: 0, c: 0 }]);
  });

  it('blocks the connect-then-scribble exploit', () => {
    let state = drawPath(board, 'color-0', topRow);
    state = applyPathSteps(state, 'color-1', [
      { r: 2, c: 0 },
      { r: 2, c: 1 },
      { r: 2, c: 2 },
    ]);
    expect(connectedPairCount(board, state.paths)).toBe(2);

    // The middle row is still empty; neither sealed color may claim it.
    for (const colorId of ['color-0', 'color-1']) {
      for (const cell of [
        { r: 1, c: 0 },
        { r: 1, c: 1 },
        { r: 1, c: 2 },
      ]) {
        expect(applyPathStep(state, colorId, cell)).toBe(state);
      }
    }
    expect(state.isComplete).toBe(false);
    expect(filledCellCount(state.paths)).toBe(6);
  });
});

describe('cut semantics', () => {
  it('cuts the victim before the crossed cell', () => {
    const board = makeBoard(3, 3, [
      { p1: { r: 0, c: 0 }, p2: { r: 2, c: 0 } },
      { p1: { r: 0, c: 2 }, p2: { r: 2, c: 2 } },
    ]);
    let state = applyPathSteps(createInitialState(board), 'color-1', [
      { r: 0, c: 2 },
      { r: 0, c: 1 },
      { r: 1, c: 1 },
    ]);
    state = applyPathSteps(state, 'color-0', [
      { r: 0, c: 0 },
      { r: 1, c: 0 },
      { r: 1, c: 1 },
    ]);

    expect(state.paths['color-1']).toEqual([
      { r: 0, c: 2 },
      { r: 0, c: 1 },
    ]);
    expect(state.paths['color-0']).toContainEqual({ r: 1, c: 1 });
  });

  it('leaves the victim only the run before the crossed cell', () => {
    const board = makeBoard(2, 3, [
      { p1: { r: 1, c: 1 }, p2: { r: 0, c: 1 } },
      { p1: { r: 0, c: 0 }, p2: { r: 1, c: 2 } },
    ]);
    let state = applyPathSteps(createInitialState(board), 'color-1', [
      { r: 0, c: 0 },
      { r: 1, c: 0 },
    ]);
    state = applyPathSteps(state, 'color-0', [
      { r: 1, c: 1 },
      { r: 1, c: 0 },
    ]);

    expect(state.paths['color-1']).toEqual([{ r: 0, c: 0 }]);
    expect(state.paths['color-0']).toContainEqual({ r: 1, c: 0 });
  });

  it('never leaves a cell claimed by two colors', () => {
    const board = twoPairBoard();
    let state = applyPathSteps(createInitialState(board), 'color-1', [
      { r: 2, c: 0 },
      { r: 1, c: 0 },
      { r: 1, c: 1 },
      { r: 1, c: 2 },
    ]);
    state = applyPathSteps(state, 'color-0', [
      { r: 0, c: 0 },
      { r: 1, c: 0 },
    ]);

    const keys = allCellKeys(state.paths);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe('interpolateCells', () => {
  it('walks a straight run, excluding the origin and including the target', () => {
    expect(interpolateCells({ r: 0, c: 0 }, { r: 0, c: 3 })).toEqual([
      [
        { r: 0, c: 1 },
        { r: 0, c: 2 },
        { r: 0, c: 3 },
      ],
    ]);
  });

  it('offers both L routes for a diagonal move', () => {
    const routes = interpolateCells({ r: 0, c: 0 }, { r: 2, c: 2 });
    expect(routes).toHaveLength(2);
    expect(routes[0]).toEqual([
      { r: 1, c: 0 },
      { r: 2, c: 0 },
      { r: 2, c: 1 },
      { r: 2, c: 2 },
    ]);
    expect(routes[1]).toEqual([
      { r: 0, c: 1 },
      { r: 0, c: 2 },
      { r: 1, c: 2 },
      { r: 2, c: 2 },
    ]);
  });

  it('returns nothing for a zero move or a jump beyond the cap', () => {
    expect(interpolateCells({ r: 1, c: 1 }, { r: 1, c: 1 })).toEqual([]);
    expect(interpolateCells({ r: 0, c: 0 }, { r: 0, c: 7 })).toEqual([]);
  });
});

describe('applyDragTo', () => {
  it('fills skipped cells when a fast drag jumps ahead', () => {
    const board = twoPairBoard();
    const state = drawPath(board, 'color-0', [{ r: 0, c: 0 }]);
    const next = applyDragTo(state, 'color-0', { r: 0, c: 0 }, { r: 0, c: 2 });
    expect(next.paths['color-0']).toEqual([
      { r: 0, c: 0 },
      { r: 0, c: 1 },
      { r: 0, c: 2 },
    ]);
  });

  it('prefers the L route that leaves another path intact', () => {
    // color-1 sits on the row-first route, so the col-first route should win.
    const board = makeBoard(3, 3, [
      { p1: { r: 0, c: 0 }, p2: { r: 2, c: 2 } },
      { p1: { r: 1, c: 0 }, p2: { r: 2, c: 1 } },
    ]);
    let state = applyPathSteps(createInitialState(board), 'color-1', [
      { r: 1, c: 0 },
      { r: 2, c: 0 },
      { r: 2, c: 1 },
    ]);
    state = applyPathStep(state, 'color-0', { r: 0, c: 0 });
    const dragged = applyDragTo(state, 'color-0', { r: 0, c: 0 }, { r: 2, c: 2 });

    expect(dragged.paths['color-0']).toEqual([
      { r: 0, c: 0 },
      { r: 0, c: 1 },
      { r: 0, c: 2 },
      { r: 1, c: 2 },
      { r: 2, c: 2 },
    ]);
    expect(dragged.paths['color-1']).toHaveLength(3);
  });

  it('ignores a jump beyond the interpolation cap', () => {
    const board = makeBoard(8, 8, [{ p1: { r: 0, c: 0 }, p2: { r: 7, c: 7 } }]);
    const state = drawPath(board, 'color-0', [{ r: 0, c: 0 }]);
    expect(applyDragTo(state, 'color-0', { r: 0, c: 0 }, { r: 0, c: 7 })).toBe(state);
  });

  it('applies as far as it can when the route is partly blocked', () => {
    const board = twoPairBoard();
    const state = drawPath(board, 'color-0', [{ r: 0, c: 0 }]);
    // (2,0) is another pair's dot, so the walk stops one cell short of it.
    const next = applyDragTo(state, 'color-0', { r: 0, c: 0 }, { r: 2, c: 0 });
    expect(next.paths['color-0']).toEqual([
      { r: 0, c: 0 },
      { r: 1, c: 0 },
    ]);
  });
});

describe('applyPathSteps', () => {
  it('keeps the cells applied before the first rejected step', () => {
    const board = twoPairBoard();
    const state = applyPathSteps(createInitialState(board), 'color-0', [
      { r: 0, c: 0 },
      { r: 0, c: 1 },
      { r: 2, c: 1 },
      { r: 1, c: 1 },
    ]);
    expect(state.paths['color-0']).toEqual([
      { r: 0, c: 0 },
      { r: 0, c: 1 },
    ]);
  });
});

describe('beginDragAt', () => {
  const board = twoPairBoard();

  it('restarts a half-drawn path from the dot that was grabbed', () => {
    const state = drawPath(board, 'color-0', [
      { r: 0, c: 0 },
      { r: 0, c: 1 },
    ]);
    const result = beginDragAt(state, { r: 0, c: 0 });
    expect(result.colorId).toBe('color-0');
    expect(result.state.paths['color-0']).toEqual([{ r: 0, c: 0 }]);
  });

  it('restarts from the opposite dot instead of ignoring the touch', () => {
    const state = drawPath(board, 'color-0', [
      { r: 0, c: 0 },
      { r: 0, c: 1 },
    ]);
    const result = beginDragAt(state, { r: 0, c: 2 });
    expect(result.colorId).toBe('color-0');
    expect(result.state.paths['color-0']).toEqual([{ r: 0, c: 2 }]);
  });

  it('adopts the color and trims when grabbing mid-path', () => {
    const state = drawPath(board, 'color-1', [
      { r: 2, c: 0 },
      { r: 1, c: 0 },
      { r: 1, c: 1 },
    ]);
    const result = beginDragAt(state, { r: 1, c: 0 });
    expect(result.colorId).toBe('color-1');
    expect(result.state.paths['color-1']).toEqual([
      { r: 2, c: 0 },
      { r: 1, c: 0 },
    ]);
  });

  it('is inert on an empty cell', () => {
    const state = createInitialState(board);
    const result = beginDragAt(state, { r: 1, c: 1 });
    expect(result.colorId).toBeNull();
    expect(result.state).toBe(state);
  });
});

describe('resolveTouchCell', () => {
  const base = { cellSize: 40, rows: 4, cols: 4 };

  it('resolves by plain floor when there is no current cell', () => {
    expect(resolveTouchCell({ ...base, x: 95, y: 5, current: null })).toEqual({ r: 0, c: 2 });
  });

  it('holds the current cell just past the boundary', () => {
    expect(resolveTouchCell({ ...base, x: 41, y: 20, current: { r: 0, c: 0 } })).toEqual({
      r: 0,
      c: 0,
    });
  });

  it('commits the neighbour once the touch is well inside it', () => {
    expect(resolveTouchCell({ ...base, x: 52, y: 20, current: { r: 0, c: 0 } })).toEqual({
      r: 0,
      c: 1,
    });
  });

  it('commits immediately when the touch jumps more than one cell', () => {
    expect(resolveTouchCell({ ...base, x: 121, y: 20, current: { r: 0, c: 0 } })).toEqual({
      r: 0,
      c: 3,
    });
  });

  it('clamps out-of-bounds coordinates to an edge cell', () => {
    expect(resolveTouchCell({ ...base, x: -30, y: 900, current: null })).toEqual({ r: 3, c: 0 });
  });
});

describe('sanitizeSavedPaths', () => {
  const board = twoPairBoard();

  it('truncates a path that was saved past its second dot', () => {
    const paths: PathState = {
      'color-0': [
        { r: 0, c: 0 },
        { r: 0, c: 1 },
        { r: 0, c: 2 },
        { r: 1, c: 2 },
        { r: 1, c: 1 },
      ],
      'color-1': [],
    };
    expect(sanitizeSavedPaths(board, paths)['color-0']).toEqual([
      { r: 0, c: 0 },
      { r: 0, c: 1 },
      { r: 0, c: 2 },
    ]);
  });

  it('drops a path that does not start at an endpoint', () => {
    expect(sanitizeSavedPaths(board, { 'color-0': [{ r: 1, c: 1 }] })['color-0']).toEqual([]);
  });

  it('truncates at a non-adjacent jump', () => {
    const paths: PathState = {
      'color-0': [
        { r: 0, c: 0 },
        { r: 2, c: 1 },
      ],
    };
    expect(sanitizeSavedPaths(board, paths)['color-0']).toEqual([{ r: 0, c: 0 }]);
  });

  it('gives a contested cell to the earlier color and truncates the later one', () => {
    const paths: PathState = {
      'color-0': [
        { r: 0, c: 0 },
        { r: 1, c: 0 },
        { r: 1, c: 1 },
      ],
      'color-1': [
        { r: 2, c: 0 },
        { r: 1, c: 0 },
      ],
    };
    const clean = sanitizeSavedPaths(board, paths);
    expect(clean['color-0']).toHaveLength(3);
    expect(clean['color-1']).toEqual([{ r: 2, c: 0 }]);
  });

  it('backfills missing pair keys', () => {
    expect(sanitizeSavedPaths(board, {})).toEqual({ 'color-0': [], 'color-1': [] });
  });

  it('leaves a legal state untouched', () => {
    const paths: PathState = {
      'color-0': [
        { r: 0, c: 0 },
        { r: 0, c: 1 },
        { r: 0, c: 2 },
      ],
      'color-1': [{ r: 2, c: 0 }],
    };
    expect(sanitizeSavedPaths(board, paths)).toEqual(paths);
  });
});

describe('win condition and coverage', () => {
  /** 2x2 where each row is one pair — the smallest fully solvable board. */
  const solvable = makeBoard(2, 2, [
    { p1: { r: 0, c: 0 }, p2: { r: 0, c: 1 } },
    { p1: { r: 1, c: 0 }, p2: { r: 1, c: 1 } },
  ]);

  it('wins when every pair connects and the grid is full', () => {
    let state = applyPathSteps(createInitialState(solvable), 'color-0', [
      { r: 0, c: 0 },
      { r: 0, c: 1 },
    ]);
    expect(state.isComplete).toBe(false);

    state = applyPathSteps(state, 'color-1', [
      { r: 1, c: 0 },
      { r: 1, c: 1 },
    ]);
    expect(state.isComplete).toBe(true);
    expect(state.coveragePercent).toBe(100);
  });

  it('does not win on a full grid with an unconnected pair', () => {
    const board = makeBoard(2, 2, [
      { p1: { r: 0, c: 0 }, p2: { r: 1, c: 1 } },
      { p1: { r: 0, c: 1 }, p2: { r: 1, c: 0 } },
    ]);
    const state = recomputeState({
      board,
      paths: {
        'color-0': [{ r: 0, c: 0 }],
        'color-1': [
          { r: 0, c: 1 },
          { r: 1, c: 1 },
          { r: 1, c: 0 },
        ],
      },
    });
    expect(state.coveragePercent).toBe(100);
    expect(state.isComplete).toBe(false);
  });

  it('does not win when all pairs connect but a cell is empty', () => {
    const board = twoPairBoard();
    let state = applyPathSteps(createInitialState(board), 'color-0', [
      { r: 0, c: 0 },
      { r: 0, c: 1 },
      { r: 0, c: 2 },
    ]);
    state = applyPathSteps(state, 'color-1', [
      { r: 2, c: 0 },
      { r: 2, c: 1 },
      { r: 2, c: 2 },
    ]);
    expect(connectedPairCount(board, state.paths)).toBe(2);
    expect(state.isComplete).toBe(false);
  });

  it('computes coverage from the filled cell set', () => {
    const board = twoPairBoard();
    const state = drawPath(board, 'color-0', [{ r: 0, c: 0 }]);
    expect(computeCoveragePercent(board, state.paths)).toBe(Math.round((1 / 9) * 100));
    expect(filledCellCount(state.paths)).toBe(1);
  });
});

describe('updatePath', () => {
  const board = twoPairBoard();

  it('rejects non-adjacent jumps', () => {
    const state = createInitialState(board);
    expect(
      updatePath(state, 'color-0', [
        { r: 0, c: 0 },
        { r: 2, c: 0 },
      ]),
    ).toBe(state);
  });

  it('rejects a path that does not start at an endpoint', () => {
    const state = createInitialState(board);
    expect(updatePath(state, 'color-0', [{ r: 1, c: 1 }])).toBe(state);
  });

  it('stops at the opposite endpoint', () => {
    const state = updatePath(createInitialState(board), 'color-0', [
      { r: 0, c: 0 },
      { r: 0, c: 1 },
      { r: 0, c: 2 },
      { r: 1, c: 2 },
    ]);
    expect(state.paths['color-0']).toHaveLength(3);
  });
});

describe('path helpers', () => {
  const board = twoPairBoard();

  it('clearPath resets a color path', () => {
    const state = drawPath(board, 'color-0', [{ r: 0, c: 0 }]);
    const cleared = recomputeState({ board, paths: clearPath(state.paths, 'color-0') });
    expect(cleared.paths['color-0']).toHaveLength(0);
  });

  it('resetBoard clears everything but keeps the board', () => {
    const state = drawPath(board, 'color-0', [{ r: 0, c: 0 }]);
    const reset = resetBoard(state);
    expect(filledCellCount(reset.paths)).toBe(0);
    expect(reset.board).toBe(board);
  });

  it('resetBoard is a no-op on an untouched board', () => {
    const state = createInitialState(board);
    expect(resetBoard(state)).toBe(state);
  });

  it('maps every drawn cell to its color', () => {
    const state = drawPath(board, 'color-0', [
      { r: 0, c: 0 },
      { r: 0, c: 1 },
    ]);
    const map = buildPathColorMap(board, state.paths);
    expect(map.get('0,1')).toBe(board.pairs[0].colorHex);
    expect(map.has('2,2')).toBe(false);
  });

  it('reports connected pair count', () => {
    const state = drawPath(board, 'color-0', [
      { r: 0, c: 0 },
      { r: 0, c: 1 },
      { r: 0, c: 2 },
    ]);
    expect(connectedPairCount(board, state.paths)).toBe(1);
  });
});
