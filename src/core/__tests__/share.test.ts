import { formatShareGrid } from '../share';
import type { GuessRow } from '../types';

function row(letters: string, states: GuessRow['states']): GuessRow {
  return { letters: letters.split(''), states };
}

describe('formatShareGrid', () => {
  it('formats a daily win grid with date and answer', () => {
    const guesses = [
      row('CRANE', ['absent', 'absent', 'present', 'absent', 'correct']),
      row('STARE', ['correct', 'correct', 'correct', 'correct', 'correct']),
    ];
    const text = formatShareGrid(guesses, 2, true, 'daily', new Date(2026, 6, 4), 'STARE');
    expect(text).toContain('Gridly Daily');
    expect(text).toContain('Jul 4, 2026');
    expect(text).toContain('2/6 · STARE');
    expect(text).toContain('🟦');
  });
});
