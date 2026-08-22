import { SEASON_1_ID, getSeasonById } from '../seasons';
import { getLevelBoard } from '../levelBank';
import { levelSpecForSeason } from '../levelCurve';
import type { LevelSpec } from '../types';

describe('levelCurve', () => {
  it('maps level 1 to an easy 4×4 three-flow puzzle', () => {
    const spec = levelSpecForSeason(SEASON_1_ID, 1);
    expect(spec.gridSize).toBe(4);
    expect(spec.pairCount).toBe(3);
    expect(spec.timeLimitSec).toBe(300);
  });

  it('ramps difficulty through the season bands', () => {
    expect(levelSpecForSeason(SEASON_1_ID, 15).gridSize).toBe(4);
    expect(levelSpecForSeason(SEASON_1_ID, 15).pairCount).toBe(3);
    expect(levelSpecForSeason(SEASON_1_ID, 30).pairCount).toBe(4);
    expect(levelSpecForSeason(SEASON_1_ID, 50).gridSize).toBe(6);
    expect(levelSpecForSeason(SEASON_1_ID, 70).pairCount).toBe(5);
    expect(levelSpecForSeason(SEASON_1_ID, 90).gridSize).toBe(8);
    expect(levelSpecForSeason(SEASON_1_ID, 100).pairCount).toBe(5);
  });

  it('clamps out-of-range levels to season bounds', () => {
    const spec = levelSpecForSeason(SEASON_1_ID, 999);
    expect(spec.gridSize).toBe(8);
    expect(spec.pairCount).toBe(5);
  });
});

describe('levelBank', () => {
  const season = getSeasonById(SEASON_1_ID)!;

  it('generates valid boards for every season 1 level', () => {
    for (let level = 1; level <= season.levelCount; level += 1) {
      const spec = levelSpecForSeason(SEASON_1_ID, level);
      const board = getLevelBoard(SEASON_1_ID, level);
      expect(board.rows).toBe(spec.gridSize);
      expect(board.cols).toBe(spec.gridSize);
      expect(board.pairs.length).toBe(spec.pairCount);
    }
  });
});
