import { generateBoard } from '../flowEngine';
import { shouldResumeSavedColorFlowGame } from '../sessionPolicy';
import type { FlowDifficulty, PersistedFlowGame } from '../types';

function savedPracticeGame(difficulty: FlowDifficulty): PersistedFlowGame {
  const board = generateBoard(difficulty, `saved-${difficulty}`);
  return {
    mode: 'practice',
    dateKey: '',
    difficulty,
    board,
    paths: {},
    status: 'playing',
    elapsedSec: 0,
    activeColorId: null,
  };
}

describe('shouldResumeSavedColorFlowGame', () => {
  const today = '2026-07-31';

  it('resumes when saved difficulty and grid size match settings', () => {
    expect(
      shouldResumeSavedColorFlowGame({
        saved: savedPracticeGame('medium'),
        mode: 'practice',
        selectedDifficulty: 'medium',
        todayDateKey: today,
      }),
    ).toBe(true);
  });

  it('does not resume an easy save when medium is selected', () => {
    expect(
      shouldResumeSavedColorFlowGame({
        saved: savedPracticeGame('easy'),
        mode: 'practice',
        selectedDifficulty: 'medium',
        todayDateKey: today,
      }),
    ).toBe(false);
  });

  it('does not resume when the saved board size disagrees with its difficulty', () => {
    const saved = savedPracticeGame('hard');
    saved.board = { ...saved.board, rows: 4 };

    expect(
      shouldResumeSavedColorFlowGame({
        saved,
        mode: 'practice',
        selectedDifficulty: 'hard',
        todayDateKey: today,
      }),
    ).toBe(false);
  });

  it('does not resume completed saves', () => {
    expect(
      shouldResumeSavedColorFlowGame({
        saved: { ...savedPracticeGame('easy'), status: 'won' },
        mode: 'practice',
        selectedDifficulty: 'easy',
        todayDateKey: today,
      }),
    ).toBe(false);
  });

  it('does not resume a prior-day daily save', () => {
    expect(
      shouldResumeSavedColorFlowGame({
        saved: { ...savedPracticeGame('easy'), mode: 'daily', dateKey: '2026-07-30' },
        mode: 'daily',
        selectedDifficulty: 'easy',
        todayDateKey: today,
      }),
    ).toBe(false);
  });

  it('resumes a same-day daily save when difficulty matches', () => {
    expect(
      shouldResumeSavedColorFlowGame({
        saved: { ...savedPracticeGame('hard'), mode: 'daily', dateKey: today },
        mode: 'daily',
        selectedDifficulty: 'hard',
        todayDateKey: today,
      }),
    ).toBe(true);
  });
});
