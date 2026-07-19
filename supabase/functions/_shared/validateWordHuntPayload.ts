const WORD_PATTERN = /^[A-Z]{5}$/;

export interface WordHuntInvitePayload {
  mode: 'custom';
  word: string;
}

export function validateWordHuntPayload(payload: unknown): WordHuntInvitePayload | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const record = payload as Record<string, unknown>;
  if (record.mode !== 'custom' || typeof record.word !== 'string') {
    return null;
  }

  const word = record.word.toUpperCase();
  if (!WORD_PATTERN.test(word)) {
    return null;
  }

  return { mode: 'custom', word };
}
