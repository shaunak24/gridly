import { solvedTileNumber, testTileColorForNumber } from '../testMode';

describe('testMode peek helpers', () => {
  it('numbers solved tiles row-major starting at 1', () => {
    expect(solvedTileNumber(0, 0, 4)).toBe(1);
    expect(solvedTileNumber(0, 3, 4)).toBe(4);
    expect(solvedTileNumber(1, 0, 4)).toBe(5);
    expect(solvedTileNumber(3, 3, 4)).toBe(16);
  });

  it('cycles tile colors by number', () => {
    expect(testTileColorForNumber(1)).toBe('#0EA5E9');
    expect(testTileColorForNumber(7)).toBe(testTileColorForNumber(1));
  });
});
