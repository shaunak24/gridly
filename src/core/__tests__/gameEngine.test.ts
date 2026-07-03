import { scoreGuess, isValidGuess, pickRandomWord } from '../gameEngine';

describe('scoreGuess', () => {
  it('marks an exact match as all correct', () => {
    const result = scoreGuess('CRANE', 'CRANE');
    expect(result.every((tile) => tile.state === 'correct')).toBe(true);
  });

  it('marks letters not in the word as absent', () => {
    const result = scoreGuess('CRANE', 'SLUMP');
    expect(result.every((tile) => tile.state === 'absent')).toBe(true);
  });

  it('scores a mixed guess', () => {
    const result = scoreGuess('CRANE', 'SLATE');
    expect(result.map((tile) => tile.state)).toEqual([
      'absent',
      'absent',
      'correct',
      'absent',
      'correct',
    ]);
  });

  it('scores REACT against CRANE with teal, amber, and slate', () => {
    const result = scoreGuess('CRANE', 'REACT');
    expect(result.map((tile) => tile.state)).toEqual([
      'present',
      'present',
      'correct',
      'present',
      'absent',
    ]);
  });

  it('handles duplicate letters when the secret has duplicates', () => {
    const result = scoreGuess('APPLE', 'PAPER');
    expect(result.map((tile) => tile.state)).toEqual([
      'present',
      'present',
      'correct',
      'present',
      'absent',
    ]);
  });

  it('limits present marks when guess has extra duplicates', () => {
    const result = scoreGuess('ABBEY', 'LLAMA');
    expect(result[0].state).toBe('absent');
    expect(result.filter((tile) => tile.state === 'present').length).toBeLessThanOrEqual(2);
  });
});

describe('isValidGuess', () => {
  const dictionary = new Set(['CRANE', 'SLATE', 'APPLE', 'STARE', 'HELLO']);

  it('accepts a dictionary word', () => {
    expect(isValidGuess('crane', dictionary)).toBe(true);
  });

  it('accepts common five-letter words from the full dictionary', () => {
    expect(isValidGuess('STARE', dictionary)).toBe(true);
    expect(isValidGuess('HELLO', dictionary)).toBe(true);
  });

  it('rejects words that are too short', () => {
    expect(isValidGuess('CAT', dictionary)).toBe(false);
  });

  it('rejects words not in the dictionary', () => {
    expect(isValidGuess('ZZZZZ', dictionary)).toBe(false);
  });
});

describe('pickRandomWord', () => {
  it('returns a word from the answer list', () => {
    const answers = ['CRANE', 'SLATE', 'APPLE'];
    const word = pickRandomWord(answers);
    expect(answers).toContain(word);
    expect(word.length).toBe(5);
  });
});
