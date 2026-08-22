import { generateBoard } from './flowEngine';
import type { FlowBoard, FlowDifficulty } from './types';

/** Fixed tier for daily puzzles — independent of practice difficulty settings. */
export const DAILY_FLOW_DIFFICULTY: FlowDifficulty = 'medium';

const CURATED_SEEDS: Record<FlowDifficulty, string[]> = {
  easy: ['cf-easy-0', 'cf-easy-1', 'cf-easy-2', 'cf-easy-3', 'cf-easy-4'],
  medium: ['cf-medium-0', 'cf-medium-1', 'cf-medium-2', 'cf-medium-3', 'cf-medium-4'],
  hard: ['cf-hard-0', 'cf-hard-1', 'cf-hard-2', 'cf-hard-3', 'cf-hard-4'],
};

const curatedCache: Partial<Record<FlowDifficulty, FlowBoard[]>> = {};

function getCuratedPuzzles(difficulty: FlowDifficulty): FlowBoard[] {
  if (!curatedCache[difficulty]) {
    curatedCache[difficulty] = CURATED_SEEDS[difficulty].map((seed) => generateBoard(difficulty, seed));
  }
  return curatedCache[difficulty]!;
}

function mixHash(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
    hash ^= hash >>> 16;
    hash = Math.imul(hash, 0x7feb352d);
    hash ^= hash >>> 15;
  }
  return Math.abs(hash);
}

export function getCuratedPuzzle(difficulty: FlowDifficulty, index: number): FlowBoard {
  const puzzles = getCuratedPuzzles(difficulty);
  const normalized = ((index % puzzles.length) + puzzles.length) % puzzles.length;
  return puzzles[normalized];
}

export function getDailyPuzzleIndex(dateKey: string, difficulty: FlowDifficulty): number {
  return mixHash(`gridly-color-flow-daily-v1:${dateKey}:${difficulty}`) % CURATED_SEEDS[difficulty].length;
}

export function getDailyBoard(dateKey: string): FlowBoard {
  return getCuratedPuzzle(DAILY_FLOW_DIFFICULTY, getDailyPuzzleIndex(dateKey, DAILY_FLOW_DIFFICULTY));
}

export function getPracticeBoard(seed: string, difficulty: FlowDifficulty): FlowBoard {
  const curatedIndex = mixHash(`gridly-color-flow-practice:${seed}:${difficulty}`) % CURATED_SEEDS[difficulty].length;
  const curated = getCuratedPuzzle(difficulty, curatedIndex);
  if (mixHash(`${seed}:procedural`) % 3 !== 0) {
    return curated;
  }

  const procedural = generateBoard(difficulty, `gridly-color-flow-procedural:${seed}`);
  return procedural;
}
