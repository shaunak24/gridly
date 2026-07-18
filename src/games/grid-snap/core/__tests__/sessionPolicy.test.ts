import { createPuzzle } from '../puzzleEngine';
import { shouldResumeSavedGridSnapGame } from '../sessionPolicy';
import type { PersistedSnapGame } from '../types';

function savedPracticeGame(
  difficulty: PersistedSnapGame['difficulty'],
  cols: number,
): PersistedSnapGame {
  const puzzle = createPuzzle(difficulty, `saved-${difficulty}-${cols}`);
  return {
    mode: 'practice',
    dateKey: '',
    difficulty,
    rows: puzzle.rows,
    cols: puzzle.cols,
    pieces: puzzle.pieces,
    imageSeed: puzzle.imageSeed,
    status: 'playing',
  };
}

describe('shouldResumeSavedGridSnapGame', () => {
  const today = '2026-07-18';

  it('resumes when saved difficulty and grid size match settings', () => {
    const saved = savedPracticeGame('medium', 6);

    expect(
      shouldResumeSavedGridSnapGame({
        saved,
        mode: 'practice',
        selectedDifficulty: 'medium',
        todayDateKey: today,
      }),
    ).toBe(true);
  });

  it('does not resume an easy 4x4 save when medium is selected', () => {
    const saved = savedPracticeGame('easy', 4);

    expect(
      shouldResumeSavedGridSnapGame({
        saved,
        mode: 'practice',
        selectedDifficulty: 'medium',
        todayDateKey: today,
      }),
    ).toBe(false);
  });

  it('does not resume when saved cols disagree with selected difficulty', () => {
    const saved = {
      ...savedPracticeGame('hard', 8),
      cols: 4,
      rows: 4,
    };

    expect(
      shouldResumeSavedGridSnapGame({
        saved,
        mode: 'practice',
        selectedDifficulty: 'hard',
        todayDateKey: today,
      }),
    ).toBe(false);
  });

  it('does not resume completed saves', () => {
    const saved = { ...savedPracticeGame('easy', 4), status: 'won' as const };

    expect(
      shouldResumeSavedGridSnapGame({
        saved,
        mode: 'practice',
        selectedDifficulty: 'easy',
        todayDateKey: today,
      }),
    ).toBe(false);
  });

  it('does not resume a prior-day daily save', () => {
    const saved: PersistedSnapGame = {
      ...savedPracticeGame('easy', 4),
      mode: 'daily',
      dateKey: '2026-07-17',
    };

    expect(
      shouldResumeSavedGridSnapGame({
        saved,
        mode: 'daily',
        selectedDifficulty: 'easy',
        todayDateKey: today,
      }),
    ).toBe(false);
  });

  it('resumes same-day daily save when difficulty matches', () => {
    const saved: PersistedSnapGame = {
      ...savedPracticeGame('hard', 8),
      mode: 'daily',
      dateKey: today,
    };

    expect(
      shouldResumeSavedGridSnapGame({
        saved,
        mode: 'daily',
        selectedDifficulty: 'hard',
        todayDateKey: today,
      }),
    ).toBe(true);
  });
});
