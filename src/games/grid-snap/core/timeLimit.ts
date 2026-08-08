import type { SnapDifficulty } from './types';

const LIMIT_SEC_BY_DIFFICULTY: Record<SnapDifficulty, number> = {
  easy: 300,
  medium: 420,
  hard: 600,
};

export function timeLimitSecForDifficulty(difficulty: SnapDifficulty): number {
  return LIMIT_SEC_BY_DIFFICULTY[difficulty];
}
