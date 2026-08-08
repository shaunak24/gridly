import { parseDictionaryResponse } from '../wordDefinition';

describe('parseDictionaryResponse', () => {
  it('extracts definition and part of speech', () => {
    const raw = JSON.stringify([
      {
        word: 'bores',
        meanings: [
          {
            partOfSpeech: 'noun',
            definitions: [{ definition: 'A hole drilled through something.' }],
          },
        ],
      },
    ]);

    expect(parseDictionaryResponse(raw)).toEqual({
      text: 'A hole drilled through something.',
      partOfSpeech: 'noun',
    });
  });

  it('returns null for empty meanings', () => {
    expect(parseDictionaryResponse('[]')).toBeNull();
  });
});
