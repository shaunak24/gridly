import { getDailyPuzzleNumber, getDailyWord, getLocalDateKey } from '../dailyWord';

describe('getDailyWord', () => {
  const answers = ['CRANE', 'SLATE', 'APPLE', 'PAPER', 'HOUSE'];

  it('returns the same word for the same date', () => {
    const date = new Date(2026, 6, 4);
    expect(getDailyWord(date, answers)).toBe(getDailyWord(date, answers));
  });

  it('usually returns different words for different dates', () => {
    const a = getDailyWord(new Date(2026, 6, 4), answers);
    const b = getDailyWord(new Date(2026, 6, 5), answers);
    expect(a).not.toBe(b);
  });

  it('returns a word from the answer list', () => {
    const word = getDailyWord(new Date(2026, 0, 1), answers);
    expect(answers).toContain(word);
  });
});

describe('getLocalDateKey', () => {
  it('formats as YYYY-MM-DD', () => {
    expect(getLocalDateKey(new Date(2026, 6, 4))).toBe('2026-07-04');
  });
});

describe('getDailyPuzzleNumber', () => {
  it('increments per day', () => {
    const n1 = getDailyPuzzleNumber(new Date(2026, 6, 4));
    const n2 = getDailyPuzzleNumber(new Date(2026, 6, 5));
    expect(n2).toBe(n1 + 1);
  });
});
