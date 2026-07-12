import {
  applyDragToSlot,
  areConnected,
  computeEdges,
  countGroups,
  createPuzzle,
  isSolved,
  moveGroupBySlotDelta,
  recomputeGroups,
  swapSlots,
  targetSlotFromDrag,
} from '../puzzleEngine';
import type { Piece } from '../types';

function piece(id: string, originRow: number, originCol: number, slotRow: number, slotCol: number): Piece {
  return { id, originRow, originCol, slotRow, slotCol, groupId: id };
}

describe('puzzleEngine', () => {
  const pieceSize = 80;

  it('creates a full grid with one piece per cell and no pre-formed groups', () => {
    const puzzle = createPuzzle('easy', 'test-seed');
    expect(puzzle.pieces).toHaveLength(16);

    const slotKeys = puzzle.pieces.map((p) => `${p.slotRow}-${p.slotCol}`);
    expect(new Set(slotKeys).size).toBe(16);
    expect(isSolved(puzzle)).toBe(false);
    expect(computeEdges(puzzle.pieces).size).toBe(0);
    expect(countGroups(puzzle.pieces)).toBe(16);
  });

  it('connects image neighbors only in the correct relative position', () => {
    const left = piece('0-0', 0, 0, 1, 1);
    const rightCorrect = piece('0-1', 0, 1, 1, 2);
    const rightWrongDirection = piece('0-1b', 0, 1, 1, 0);

    expect(areConnected(left, rightCorrect)).toBe(true);
    // image neighbor placed on the wrong side must not connect
    expect(areConnected(left, rightWrongDirection)).toBe(false);
  });

  it('does not connect non-neighbors that merely sit side by side', () => {
    const a = piece('0-0', 0, 0, 0, 0);
    const farNeighbor = piece('3-3', 3, 3, 0, 1);
    expect(areConnected(a, farNeighbor)).toBe(false);
  });

  it('swaps two tiles when dragged to another cell', () => {
    const pieces = [piece('0-0', 0, 0, 0, 0), piece('0-1', 0, 1, 2, 3)];
    const swapped = swapSlots(pieces, { row: 0, col: 0 }, { row: 2, col: 3 });
    expect(swapped.find((p) => p.id === '0-0')).toMatchObject({ slotRow: 2, slotCol: 3 });
    expect(swapped.find((p) => p.id === '0-1')).toMatchObject({ slotRow: 0, slotCol: 0 });
  });

  it('resolves drag to a target grid cell from a translation', () => {
    const p = piece('0-0', 0, 0, 0, 0);
    expect(targetSlotFromDrag(p, pieceSize * 3, 0, pieceSize, 4, 4)).toEqual({ row: 0, col: 3 });
    expect(targetSlotFromDrag(p, 0, pieceSize * 2, pieceSize, 4, 4)).toEqual({ row: 2, col: 0 });
  });

  it('groups pieces into connected components after they line up correctly', () => {
    const pieces = recomputeGroups(
      [
        piece('0-0', 0, 0, 0, 0),
        piece('0-1', 0, 1, 0, 1),
        piece('1-1', 1, 1, 2, 2),
        piece('3-3', 3, 3, 3, 3),
      ],
      4,
    );

    const p00 = pieces.find((p) => p.id === '0-0');
    const p01 = pieces.find((p) => p.id === '0-1');
    expect(p00?.groupId).toBe(p01?.groupId);
    expect(countGroups(pieces)).toBe(3);
  });

  it('splits a group again when a piece is moved away', () => {
    let pieces = recomputeGroups(
      [piece('0-0', 0, 0, 0, 0), piece('0-1', 0, 1, 0, 1), piece('3-3', 3, 3, 3, 3)],
      4,
    );
    expect(countGroups(pieces)).toBe(2);

    // move the right piece far away, breaking the connection
    pieces = pieces.map((p) => (p.id === '0-1' ? { ...p, slotRow: 3, slotCol: 0 } : p));
    pieces = recomputeGroups(pieces, 4);
    expect(countGroups(pieces)).toBe(3);
  });

  it('moves a snapped group together when there is room', () => {
    const pieces = recomputeGroups(
      [
        piece('0-0', 0, 0, 0, 2),
        piece('0-1', 0, 1, 0, 3),
        piece('1-0', 1, 0, 0, 0),
        piece('1-1', 1, 1, 0, 1),
      ],
      4,
    );
    const groupId = pieces.find((p) => p.id === '0-0')?.groupId as string;

    const moved = moveGroupBySlotDelta(pieces, groupId, 0, -2, 4);
    expect(moved).not.toBeNull();
    expect(moved?.find((p) => p.id === '0-0')).toMatchObject({ slotRow: 0, slotCol: 0 });
    expect(moved?.find((p) => p.id === '0-1')).toMatchObject({ slotRow: 0, slotCol: 1 });
    expect(moved?.find((p) => p.id === '1-0')).toMatchObject({ slotRow: 0, slotCol: 2 });
    expect(moved?.find((p) => p.id === '1-1')).toMatchObject({ slotRow: 0, slotCol: 3 });
  });

  it('applies drag as a swap for a single tile', () => {
    const pieces = recomputeGroups(
      [piece('0-0', 0, 0, 0, 0), piece('0-3', 0, 3, 0, 3)],
      4,
    );
    const next = applyDragToSlot(pieces, '0-0', { row: 0, col: 3 }, 4);
    expect(next.find((p) => p.id === '0-0')).toMatchObject({ slotRow: 0, slotCol: 3 });
    expect(next.find((p) => p.id === '0-3')).toMatchObject({ slotRow: 0, slotCol: 0 });
  });

  it('reports solved when every tile is in its origin cell', () => {
    const puzzle = createPuzzle('easy', 'solve-test');
    const solvedPieces = puzzle.pieces.map((p) => ({
      ...p,
      slotRow: p.originRow,
      slotCol: p.originCol,
    }));
    expect(isSolved({ ...puzzle, pieces: solvedPieces })).toBe(true);
  });
});
