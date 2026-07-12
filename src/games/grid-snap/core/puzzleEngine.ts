import type { GridSlot, Piece, PuzzleState, SnapDifficulty } from './types';
import { GRID_SIZE_BY_DIFFICULTY } from './types';

function pieceId(row: number, col: number): string {
  return `${row}-${col}`;
}

function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) || 1;
}

function allSlots(size: number): GridSlot[] {
  const slots: GridSlot[] = [];
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      slots.push({ row, col });
    }
  }
  return slots;
}

function seededShuffle<T>(items: T[], seed: string): T[] {
  const result = [...items];
  let state = hashSeed(seed);
  for (let i = result.length - 1; i > 0; i -= 1) {
    state = (state * 1103515245 + 12345) | 0;
    const j = Math.abs(state) % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function slotKey(row: number, col: number): string {
  return `${row}-${col}`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function gridSizeForDifficulty(difficulty: SnapDifficulty): number {
  return GRID_SIZE_BY_DIFFICULTY[difficulty];
}

export function getPieceXY(piece: Piece, pieceSize: number): { x: number; y: number } {
  return {
    x: piece.slotCol * pieceSize,
    y: piece.slotRow * pieceSize,
  };
}

export function areOriginNeighbors(a: Piece, b: Piece): boolean {
  const rowDiff = Math.abs(a.originRow - b.originRow);
  const colDiff = Math.abs(a.originCol - b.originCol);
  return rowDiff + colDiff === 1;
}

export function areSlotsAdjacent(a: Piece, b: Piece): boolean {
  const rowDiff = Math.abs(a.slotRow - b.slotRow);
  const colDiff = Math.abs(a.slotCol - b.slotCol);
  return rowDiff + colDiff === 1;
}

/**
 * Two pieces are connected only when they are image neighbors AND placed in the
 * correct relative position on the grid (their slot offset equals their origin
 * offset). This is what makes a jigsaw group meaningful: it reflects real
 * progress rather than a coincidental adjacency.
 */
export function areConnected(a: Piece, b: Piece): boolean {
  const originDr = b.originRow - a.originRow;
  const originDc = b.originCol - a.originCol;
  if (Math.abs(originDr) + Math.abs(originDc) !== 1) {
    return false;
  }
  const slotDr = b.slotRow - a.slotRow;
  const slotDc = b.slotCol - a.slotCol;
  return originDr === slotDr && originDc === slotDc;
}

export function edgeKey(idA: string, idB: string): string {
  return idA < idB ? `${idA}|${idB}` : `${idB}|${idA}`;
}

/** All active connections (correctly placed adjacent image neighbors). */
export function computeEdges(pieces: Piece[]): Set<string> {
  const bySlot = new Map<string, Piece>();
  for (const piece of pieces) {
    bySlot.set(slotKey(piece.slotRow, piece.slotCol), piece);
  }

  const edges = new Set<string>();
  for (const piece of pieces) {
    const right = bySlot.get(slotKey(piece.slotRow, piece.slotCol + 1));
    const down = bySlot.get(slotKey(piece.slotRow + 1, piece.slotCol));
    if (right && areConnected(piece, right)) {
      edges.add(edgeKey(piece.id, right.id));
    }
    if (down && areConnected(piece, down)) {
      edges.add(edgeKey(piece.id, down.id));
    }
  }
  return edges;
}

/**
 * Assigns a stable groupId to every piece by computing connected components over
 * the current connections. Groups are always derived from the live board, so
 * they split apart and merge as pieces move. A group's id is the piece id with
 * the smallest origin index in the component, keeping it deterministic.
 */
export function recomputeGroups(pieces: Piece[], cols: number): Piece[] {
  const parent = new Map<string, string>();
  pieces.forEach((piece) => parent.set(piece.id, piece.id));

  const find = (id: string): string => {
    let root = id;
    while (parent.get(root) !== root) {
      root = parent.get(root) as string;
    }
    let cursor = id;
    while (parent.get(cursor) !== root) {
      const next = parent.get(cursor) as string;
      parent.set(cursor, root);
      cursor = next;
    }
    return root;
  };

  const union = (a: string, b: string): void => {
    const rootA = find(a);
    const rootB = find(b);
    if (rootA !== rootB) {
      parent.set(rootA, rootB);
    }
  };

  const byId = new Map(pieces.map((piece) => [piece.id, piece] as const));
  const bySlot = new Map<string, Piece>();
  for (const piece of pieces) {
    bySlot.set(slotKey(piece.slotRow, piece.slotCol), piece);
  }

  for (const piece of pieces) {
    const right = bySlot.get(slotKey(piece.slotRow, piece.slotCol + 1));
    const down = bySlot.get(slotKey(piece.slotRow + 1, piece.slotCol));
    if (right && areConnected(piece, right)) {
      union(piece.id, right.id);
    }
    if (down && areConnected(piece, down)) {
      union(piece.id, down.id);
    }
  }

  const originIndex = (piece: Piece): number => piece.originRow * cols + piece.originCol;

  const groupLeader = new Map<string, string>();
  for (const piece of pieces) {
    const root = find(piece.id);
    const currentLeader = groupLeader.get(root);
    if (currentLeader === undefined) {
      groupLeader.set(root, piece.id);
    } else {
      const leaderPiece = byId.get(currentLeader) as Piece;
      if (originIndex(piece) < originIndex(leaderPiece)) {
        groupLeader.set(root, piece.id);
      }
    }
  }

  return pieces.map((piece) => ({
    ...piece,
    groupId: groupLeader.get(find(piece.id)) as string,
  }));
}

function buildArrangement(size: number, seed: string): Piece[] {
  const shuffledSlots = seededShuffle(allSlots(size), seed);
  const pieces: Piece[] = [];
  let slotIndex = 0;
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      const id = pieceId(row, col);
      const slot = shuffledSlots[slotIndex];
      slotIndex += 1;
      pieces.push({
        id,
        originRow: row,
        originCol: col,
        slotRow: slot.row,
        slotCol: slot.col,
        groupId: id,
      });
    }
  }
  return pieces;
}

export function createPuzzle(difficulty: SnapDifficulty, imageSeed: string): PuzzleState {
  const size = gridSizeForDifficulty(difficulty);

  let pieces = buildArrangement(size, imageSeed);
  // Start with no pre-formed groups so the board never opens pre-solved in spots.
  for (let attempt = 1; attempt <= 25; attempt += 1) {
    const solved = pieces.every(
      (piece) => piece.slotRow === piece.originRow && piece.slotCol === piece.originCol,
    );
    if (!solved && computeEdges(pieces).size === 0) {
      break;
    }
    pieces = buildArrangement(size, `${imageSeed}-shuffle-${attempt}`);
  }

  return {
    rows: size,
    cols: size,
    pieces: recomputeGroups(pieces, size),
    imageSeed,
  };
}

function findPieceAtSlot(pieces: Piece[], slot: GridSlot): Piece | undefined {
  return pieces.find((piece) => piece.slotRow === slot.row && piece.slotCol === slot.col);
}

export function swapSlots(pieces: Piece[], slotA: GridSlot, slotB: GridSlot): Piece[] {
  const pieceA = findPieceAtSlot(pieces, slotA);
  const pieceB = findPieceAtSlot(pieces, slotB);
  if (!pieceA || !pieceB || pieceA.id === pieceB.id) {
    return pieces;
  }

  return pieces.map((piece) => {
    if (piece.id === pieceA.id) {
      return { ...piece, slotRow: slotB.row, slotCol: slotB.col };
    }
    if (piece.id === pieceB.id) {
      return { ...piece, slotRow: slotA.row, slotCol: slotA.col };
    }
    return piece;
  });
}

export function targetSlotFromDrag(
  piece: Piece,
  dx: number,
  dy: number,
  pieceSize: number,
  rows: number,
  cols: number,
): GridSlot {
  const centerX = piece.slotCol * pieceSize + pieceSize / 2 + dx;
  const centerY = piece.slotRow * pieceSize + pieceSize / 2 + dy;
  return {
    row: clamp(Math.floor(centerY / pieceSize), 0, rows - 1),
    col: clamp(Math.floor(centerX / pieceSize), 0, cols - 1),
  };
}

/**
 * Rigidly translates every piece in a group by (dRow, dCol). Pieces displaced
 * from the destination cells are relocated into the cells the group vacated.
 * Returns null when the move would push the group off the board or cannot be
 * resolved as a clean shuffle of occupants.
 */
export function moveGroupBySlotDelta(
  pieces: Piece[],
  groupId: string,
  dRow: number,
  dCol: number,
  gridSize: number,
): Piece[] | null {
  if (dRow === 0 && dCol === 0) {
    return pieces;
  }

  const groupPieces = pieces.filter((piece) => piece.groupId === groupId);
  const slotMap = new Map(pieces.map((piece) => [slotKey(piece.slotRow, piece.slotCol), piece] as const));
  const nextSlots = new Map<string, GridSlot>();

  for (const piece of groupPieces) {
    const row = piece.slotRow + dRow;
    const col = piece.slotCol + dCol;
    if (row < 0 || row >= gridSize || col < 0 || col >= gridSize) {
      return null;
    }
    nextSlots.set(piece.id, { row, col });
  }

  const vacated = new Set(groupPieces.map((piece) => slotKey(piece.slotRow, piece.slotCol)));
  const occupiedKeys = [...nextSlots.values()].map((slot) => slotKey(slot.row, slot.col));
  const enteringKeys = occupiedKeys.filter((key) => !vacated.has(key));
  const leavingKeys = [...vacated].filter((key) => !occupiedKeys.includes(key));

  if (enteringKeys.length !== leavingKeys.length) {
    return null;
  }

  const displaced = enteringKeys
    .map((key) => slotMap.get(key))
    .filter((piece): piece is Piece => Boolean(piece));
  if (displaced.length !== enteringKeys.length) {
    return null;
  }

  let result = pieces.map((piece) => {
    const next = nextSlots.get(piece.id);
    if (next) {
      return { ...piece, slotRow: next.row, slotCol: next.col };
    }
    return piece;
  });

  for (let index = 0; index < displaced.length; index += 1) {
    const [row, col] = leavingKeys[index].split('-').map(Number);
    const displacedId = displaced[index].id;
    result = result.map((piece) =>
      piece.id === displacedId ? { ...piece, slotRow: row, slotCol: col } : piece,
    );
  }

  return result;
}

export function applyDragToSlot(
  pieces: Piece[],
  draggedPieceId: string,
  targetSlot: GridSlot,
  gridSize: number,
): Piece[] {
  const dragged = pieces.find((piece) => piece.id === draggedPieceId);
  if (!dragged) {
    return pieces;
  }

  const fromSlot = { row: dragged.slotRow, col: dragged.slotCol };
  if (fromSlot.row === targetSlot.row && fromSlot.col === targetSlot.col) {
    return pieces;
  }

  const dRow = targetSlot.row - fromSlot.row;
  const dCol = targetSlot.col - fromSlot.col;
  const groupSize = pieces.filter((piece) => piece.groupId === dragged.groupId).length;

  if (groupSize > 1) {
    const moved = moveGroupBySlotDelta(pieces, dragged.groupId, dRow, dCol, gridSize);
    if (moved) {
      return moved;
    }
  }

  return swapSlots(pieces, fromSlot, targetSlot);
}

export function isSolved(state: PuzzleState): boolean {
  return state.pieces.every(
    (piece) => piece.slotRow === piece.originRow && piece.slotCol === piece.originCol,
  );
}

export function countGroups(pieces: Piece[]): number {
  return new Set(pieces.map((piece) => piece.groupId)).size;
}

export function isValidPersistedPiece(piece: Piece): boolean {
  return (
    typeof piece.slotRow === 'number' &&
    typeof piece.slotCol === 'number' &&
    typeof piece.originRow === 'number' &&
    typeof piece.originCol === 'number' &&
    typeof piece.groupId === 'string'
  );
}
