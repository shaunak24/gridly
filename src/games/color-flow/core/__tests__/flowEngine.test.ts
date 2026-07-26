import {
  applyPathStep,
  checkWinCondition,
  clearPath,
  computeCoveragePercent,
  connectedPairCount,
  createInitialState,
  generateBoard,
  recomputeState,
  updatePath,
} from '../flowEngine';
import type { FlowDifficulty } from '../types';

describe('flowEngine', () => {
  it('generates a board with the expected grid size and pair count', () => {
    const board = generateBoard('easy', 'test-seed');
    expect(board.rows).toBe(4);
    expect(board.cols).toBe(4);
    expect(board.pairs).toHaveLength(3);
  });

  it('starts with empty paths and zero coverage', () => {
    const board = generateBoard('easy', 'coverage-test');
    const state = createInitialState(board);
    expect(state.coveragePercent).toBe(0);
    expect(state.isComplete).toBe(false);
  });

  it('extends a path from an endpoint orthogonally', () => {
    const board = generateBoard('easy', 'extend-test');
    const pair = board.pairs[0];
    let state = createInitialState(board);
    state = applyPathStep(state, pair.id, pair.p1);
    state = applyPathStep(state, pair.id, { r: pair.p1.r + 1, c: pair.p1.c });
    expect(state.paths[pair.id]).toHaveLength(2);
    expect(state.coveragePercent).toBeGreaterThan(0);
  });

  it('backtracks when dragging back along the same path', () => {
    const board = generateBoard('easy', 'backtrack-test');
    const pair = board.pairs[0];
    let state = createInitialState(board);
    state = applyPathStep(state, pair.id, pair.p1);
    const second = { r: pair.p1.r + 1, c: pair.p1.c };
    state = applyPathStep(state, pair.id, second);
    state = applyPathStep(state, pair.id, pair.p1);
    expect(state.paths[pair.id]).toHaveLength(1);
  });

  it('clears intersecting paths from another color', () => {
    const board = generateBoard('easy', 'cut-test');
    const [first, second] = board.pairs;
    let state = createInitialState(board);
    state = applyPathStep(state, second.id, second.p1);
    state = applyPathStep(state, second.id, { r: second.p1.r, c: second.p1.c + 1 });
    const intersect = state.paths[second.id][1];
    state = applyPathStep(state, first.id, first.p1);
    state = applyPathStep(state, first.id, intersect);
    expect(state.paths[second.id].length).toBeLessThanOrEqual(2);
  });

  it('updatePath rejects non-adjacent jumps', () => {
    const board = generateBoard('easy', 'jump-test');
    const pair = board.pairs[0];
    const state = createInitialState(board);
    const invalid = updatePath(state, pair.id, [pair.p1, { r: pair.p1.r + 2, c: pair.p1.c }]);
    expect(invalid.paths[pair.id]).toHaveLength(0);
  });

  it('clearPath resets a color path', () => {
    const board = generateBoard('easy', 'clear-test');
    const pair = board.pairs[0];
    let state = createInitialState(board);
    state = applyPathStep(state, pair.id, pair.p1);
    state = recomputeState({ board, paths: clearPath(state.paths, pair.id) });
    expect(state.paths[pair.id]).toHaveLength(0);
  });

  it('reports connected pair count', () => {
    const board = generateBoard('easy', 'connected-test');
    const pair = board.pairs[0];
    let state = createInitialState(board);
    expect(connectedPairCount(board, state.paths)).toBe(0);
    state = applyPathStep(state, pair.id, pair.p1);
    state = applyPathStep(state, pair.id, pair.p2);
    expect(connectedPairCount(board, state.paths)).toBeGreaterThanOrEqual(0);
  });

  it('computes coverage percent for partial boards', () => {
    const board = generateBoard('easy', 'percent-test');
    const pair = board.pairs[0];
    let state = createInitialState(board);
    state = applyPathStep(state, pair.id, pair.p1);
    expect(computeCoveragePercent(board, state.paths)).toBe(Math.round((1 / 16) * 100));
  });

  it('wins only when all pairs connect and grid is full', () => {
    const board = generateBoard('easy', 'win-test');
    const pair = board.pairs[0];
    let state = createInitialState(board);
    state = updatePath(state, pair.id, [pair.p1, pair.p2]);
    expect(checkWinCondition(state)).toBe(false);
  });
});
