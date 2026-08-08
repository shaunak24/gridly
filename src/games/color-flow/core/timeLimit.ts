import type { FlowDifficulty } from './types';

const LIMIT_SEC_BY_DIFFICULTY: Record<FlowDifficulty, number> = {
  easy: 300,
  medium: 120,
  hard: 300,
};

export function timeLimitSecForDifficulty(difficulty: FlowDifficulty): number {
  return LIMIT_SEC_BY_DIFFICULTY[difficulty];
}
