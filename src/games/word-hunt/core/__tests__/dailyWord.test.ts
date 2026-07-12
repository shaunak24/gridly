import { getDailyPuzzleNumber, getDailyWord, getLocalDateKey } from '../dailyWord';

describe('getDailyWord', () => {
  const answers = ['CRANE', 'SLATE', 'APPLE', 'PAPER', 'HOUSE'];
  const manyAnswers = Array.from({ length: 500 }, (_, i) => `W${String(i).padStart(4, '0')}`);

  it('returns the same word for the same date', () => {
    const date = new Date(2026, 6, 4);
    expect(getDailyWord(date, answers)).toBe(getDailyWord(date, answers));
  });

  it('usually returns different words for different dates', () => {
    const a = getDailyWord(new Date(2026, 6, 4), manyAnswers);
    const b = getDailyWord(new Date(2026, 6, 5), manyAnswers);
    expect(a).not.toBe(b);
  });

  it('returns a word from the answer list', () => {
    const word = getDailyWord(new Date(2026, 0, 1), answers);
    expect(answers).toContain(word);
  });

  it('does not walk sequentially through a sorted answer list', () => {
    const sortedAnswers = [...manyAnswers].sort();
    const indices: number[] = [];
    for (let day = 1; day <= 14; day += 1) {
      const date = new Date(2026, 0, day);
      const word = getDailyWord(date, sortedAnswers);
      indices.push(sortedAnswers.indexOf(word));
    }
    const consecutiveDays = indices
      .slice(1)
      .filter((index, i) => index === indices[i] + 1).length;
    expect(consecutiveDays).toBe(0);
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
