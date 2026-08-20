import type { Piece } from './types';

export const IS_TEST_MODE = process.env.EXPO_PUBLIC_GRID_SNAP_TEST === '1';

export const TEST_IMAGE_SENTINEL = 'grid-snap-test-mode';

export const TEST_TILE_COLORS = ['#0EA5E9', '#22C55E', '#F97316', '#A855F7', '#EF4444', '#14B8A6'] as const;

export function tileNumber(piece: Piece, cols: number): number {
  return piece.originRow * cols + piece.originCol + 1;
}

export function testTileColorForNumber(number: number): string {
  return TEST_TILE_COLORS[(number - 1) % TEST_TILE_COLORS.length];
}

export function solvedTileNumber(row: number, col: number, cols: number): number {
  return row * cols + col + 1;
}
