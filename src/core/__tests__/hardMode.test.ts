import { violatesHardMode } from '../hardMode';
import type { GuessRow } from '../types';

function row(letters: string, states: GuessRow['states']): GuessRow {
  return { letters: letters.split(''), states };
}

describe('violatesHardMode', () => {
  it('requires green letters to stay in position', () => {
    const guesses = [row('CRANE', ['correct', 'absent', 'absent', 'absent', 'absent'])];
    expect(violatesHardMode('BRANE', guesses, 1)).toBe(true);
    expect(violatesHardMode('CRANE', guesses, 1)).toBe(false);
  });

  it('requires yellow letters to appear in the guess', () => {
    const guesses = [row('SLATE', ['absent', 'absent', 'present', 'absent', 'correct'])];
    expect(violatesHardMode('BRICK', guesses, 1)).toBe(true);
    expect(violatesHardMode('STALE', guesses, 1)).toBe(false);
  });

  it('allows any guess when no hints exist', () => {
    expect(violatesHardMode('CRANE', [], 0)).toBe(false);
  });
});
