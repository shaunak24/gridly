jest.mock('expo-linking', () => ({
  createURL: (path: string, options?: { queryParams?: Record<string, string> }) => {
    const params = new URLSearchParams(options?.queryParams).toString();
    return `gridly://${path}?${params}`;
  },
}));

import {
  buildCustomPuzzleLink,
  decodeCustomWord,
  encodeCustomWord,
  formatCustomPuzzleShareMessage,
} from '../customPuzzle';

describe('customPuzzle', () => {
  it('encodes and decodes a word', () => {
    const code = encodeCustomWord('crane');
    expect(code).toMatch(/^g1:/);
    expect(decodeCustomWord(code)).toBe('CRANE');
  });

  it('rejects invalid codes', () => {
    expect(decodeCustomWord('bad')).toBeNull();
    expect(decodeCustomWord('g1:zzzzzzzzzz')).toBeNull();
  });

  it('builds a share link', () => {
    const link = buildCustomPuzzleLink('BRAVE');
    expect(link).toContain('gridly://games/word-hunt/play?');
    expect(link).toContain('mode=custom');
    const code = new URLSearchParams(link.split('?')[1]).get('code') ?? '';
    expect(decodeCustomWord(code)).toBe('BRAVE');
  });

  it('formats a share message with the link', () => {
    const message = formatCustomPuzzleShareMessage('gridly://game?mode=custom&code=g1:abc');
    expect(message).toContain('Can you guess my Gridly word?');
    expect(message).toContain('gridly://game?mode=custom&code=g1:abc');
  });
});
