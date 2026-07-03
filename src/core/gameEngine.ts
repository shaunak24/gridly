import type { ScoredTile } from './types';
import { WORD_LENGTH } from './types';

export function scoreGuess(secret: string, guess: string): ScoredTile[] {
  const normalizedSecret = secret.toUpperCase();
  const normalizedGuess = guess.toUpperCase();

  const result: ScoredTile[] = normalizedGuess.split('').map((letter) => ({
    letter,
    state: 'absent',
  }));

  const secretCounts = new Map<string, number>();

  for (let i = 0; i < WORD_LENGTH; i += 1) {
    if (normalizedGuess[i] === normalizedSecret[i]) {
      result[i].state = 'correct';
    } else {
      const letter = normalizedSecret[i];
      secretCounts.set(letter, (secretCounts.get(letter) ?? 0) + 1);
    }
  }

  for (let i = 0; i < WORD_LENGTH; i += 1) {
    if (result[i].state === 'correct') {
      continue;
    }

    const letter = normalizedGuess[i];
    const remaining = secretCounts.get(letter) ?? 0;

    if (remaining > 0) {
      result[i].state = 'present';
      secretCounts.set(letter, remaining - 1);
    }
  }

  return result;
}

export function isValidGuess(
  guess: string,
  allowedGuesses: ReadonlySet<string>,
): boolean {
  if (guess.length !== WORD_LENGTH) {
    return false;
  }

  return allowedGuesses.has(guess.toUpperCase());
}

export function pickRandomWord(answerWords: readonly string[]): string {
  const index = Math.floor(Math.random() * answerWords.length);
  return answerWords[index];
}

export function mergeLetterStates(
  current: Record<string, 'default' | 'correct' | 'present' | 'absent'>,
  scored: ScoredTile[],
): Record<string, 'default' | 'correct' | 'present' | 'absent'> {
  const next = { ...current };
  const rank = { default: 0, absent: 1, present: 2, correct: 3 };

  for (const tile of scored) {
    const letter = tile.letter;
    const existing = next[letter] ?? 'default';
    if (rank[tile.state] > rank[existing]) {
      next[letter] = tile.state;
    }
  }

  return next;
}
