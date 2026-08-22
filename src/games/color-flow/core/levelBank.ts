import { generateBoardFromSpec } from './flowEngine';
import { levelSpecForSeason } from './levelCurve';
import type { FlowBoard } from './types';

export function levelBoardSeed(seasonId: string, level: number): string {
  return `gridly-cf-${seasonId}-level-${level}`;
}

export function getLevelBoard(seasonId: string, level: number): FlowBoard {
  const spec = levelSpecForSeason(seasonId, level);
  return generateBoardFromSpec(spec, levelBoardSeed(seasonId, level));
}
