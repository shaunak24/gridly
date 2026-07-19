import type { WordHuntInvitePayload } from './types';

export function getWordHuntCustomWord(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const record = payload as WordHuntInvitePayload;
  if (record.mode !== 'custom' || typeof record.word !== 'string') {
    return null;
  }

  const word = record.word.toUpperCase();
  if (!/^[A-Z]{5}$/.test(word)) {
    return null;
  }

  return word;
}
