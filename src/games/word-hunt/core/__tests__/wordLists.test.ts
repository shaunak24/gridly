import { wordLists } from '../wordLists';

describe('wordLists', () => {
  it('includes common guessable five-letter words', () => {
    expect(wordLists.allowedGuessSet.has('STARE')).toBe(true);
    expect(wordLists.allowedGuessSet.has('HELLO')).toBe(true);
    expect(wordLists.allowedGuessSet.has('CRANE')).toBe(true);
  });

  it('includes every answer word as a valid guess', () => {
    for (const word of wordLists.answers) {
      expect(wordLists.allowedGuessSet.has(word)).toBe(true);
    }
  });
});
