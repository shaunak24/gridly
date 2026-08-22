import type { LevelSpec } from './types';
import { getSeasonById } from './seasons';

interface LevelBand {
  fromLevel: number;
  toLevel: number;
  gridSize: number;
  pairCount: number;
  timeLimitSec: number;
  timeLimitSecEnd: number;
}

const S1_BANDS: LevelBand[] = [
  { fromLevel: 1, toLevel: 15, gridSize: 4, pairCount: 3, timeLimitSec: 300, timeLimitSecEnd: 286 },
  { fromLevel: 16, toLevel: 30, gridSize: 4, pairCount: 4, timeLimitSec: 240, timeLimitSecEnd: 226 },
  { fromLevel: 31, toLevel: 45, gridSize: 6, pairCount: 3, timeLimitSec: 180, timeLimitSecEnd: 166 },
  { fromLevel: 46, toLevel: 60, gridSize: 6, pairCount: 4, timeLimitSec: 150, timeLimitSecEnd: 136 },
  { fromLevel: 61, toLevel: 75, gridSize: 6, pairCount: 5, timeLimitSec: 120, timeLimitSecEnd: 106 },
  { fromLevel: 76, toLevel: 88, gridSize: 8, pairCount: 4, timeLimitSec: 240, timeLimitSecEnd: 226 },
  { fromLevel: 89, toLevel: 100, gridSize: 8, pairCount: 5, timeLimitSec: 180, timeLimitSecEnd: 168 },
];

function bandForLevel(level: number, bands: LevelBand[]): LevelBand {
  for (const band of bands) {
    if (level >= band.fromLevel && level <= band.toLevel) {
      return band;
    }
  }
  return bands[bands.length - 1];
}

function interpolateTimeLimit(band: LevelBand, level: number): number {
  const span = band.toLevel - band.fromLevel;
  if (span <= 0) {
    return band.timeLimitSec;
  }
  const progress = (level - band.fromLevel) / span;
  const delta = band.timeLimitSec - band.timeLimitSecEnd;
  return Math.round(band.timeLimitSec - delta * progress);
}

function levelSpecFromBand(band: LevelBand, level: number): LevelSpec {
  return {
    gridSize: band.gridSize,
    pairCount: band.pairCount,
    timeLimitSec: interpolateTimeLimit(band, level),
  };
}

export function levelSpecForSeason(seasonId: string, level: number): LevelSpec {
  const season = getSeasonById(seasonId);
  if (!season) {
    return levelSpecForSeason('s1', 1);
  }

  const clamped = Math.max(1, Math.min(level, season.levelCount));

  if (season.curveId === 's1-curve') {
    return levelSpecFromBand(bandForLevel(clamped, S1_BANDS), clamped);
  }

  return levelSpecFromBand(S1_BANDS[0], 1);
}

export function difficultyLabelForSpec(spec: LevelSpec): string {
  return `${spec.gridSize}×${spec.gridSize} · ${spec.pairCount} flows`;
}
