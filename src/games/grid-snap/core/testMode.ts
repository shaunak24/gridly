import type { Piece } from './types';

export const IS_TEST_MODE = process.env.EXPO_PUBLIC_GRID_SNAP_TEST === '1';

export const TEST_IMAGE_SENTINEL = 'grid-snap-test-mode';

export function tileNumber(piece: Piece, cols: number): number {
  return piece.originRow * cols + piece.originCol + 1;
}
