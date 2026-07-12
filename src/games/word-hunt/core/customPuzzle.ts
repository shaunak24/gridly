import * as Linking from 'expo-linking';

const CUSTOM_CODE_PREFIX = 'g1:';

function toHex(word: string): string {
  return word
    .toUpperCase()
    .split('')
    .map((char) => char.charCodeAt(0).toString(16).padStart(2, '0'))
    .join('');
}

function fromHex(code: string): string | null {
  if (code.length !== 10) {
    return null;
  }

  const chars = code.match(/.{2}/g);
  if (!chars) {
    return null;
  }

  const word = chars.map((hex) => String.fromCharCode(Number.parseInt(hex, 16))).join('');
  if (!/^[A-Z]{5}$/.test(word)) {
    return null;
  }

  return word;
}

export function encodeCustomWord(word: string): string {
  return `${CUSTOM_CODE_PREFIX}${toHex(word)}`;
}

export function decodeCustomWord(code: string): string | null {
  if (!code.startsWith(CUSTOM_CODE_PREFIX)) {
    return null;
  }

  return fromHex(code.slice(CUSTOM_CODE_PREFIX.length));
}

export function buildCustomPuzzleLink(word: string): string {
  const code = encodeCustomWord(word);
  return Linking.createURL('games/word-hunt/play', {
    queryParams: { mode: 'custom', code },
  });
}

export function formatCustomPuzzleShareMessage(link: string): string {
  return [
    'Can you guess my Gridly word? 🧩',
    '',
    'Open this link in Gridly:',
    link,
    '',
    "If the link isn't clickable, copy and paste it into your browser.",
  ].join('\n');
}
