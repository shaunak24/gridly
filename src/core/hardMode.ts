import type { GuessRow } from './types';
import { WORD_LENGTH } from './types';

export function getRequiredPresentLetters(guesses: GuessRow[], upToRow: number): Set<string> {
  const required = new Set<string>();

  for (let rowIndex = 0; rowIndex < upToRow; rowIndex += 1) {
    const row = guesses[rowIndex];
    for (let i = 0; i < WORD_LENGTH; i += 1) {
      if (row.states[i] === 'present') {
        required.add(row.letters[i]);
      }
    }
  }

  return required;
}

export function violatesHardMode(
  guess: string,
  guesses: GuessRow[],
  currentRowIndex: number,
): boolean {
  const normalized = guess.toUpperCase();

  for (let rowIndex = 0; rowIndex < currentRowIndex; rowIndex += 1) {
    const row = guesses[rowIndex];
    for (let i = 0; i < WORD_LENGTH; i += 1) {
      if (row.states[i] === 'correct' && normalized[i] !== row.letters[i]) {
        return true;
      }
    }
  }

  const requiredPresent = getRequiredPresentLetters(guesses, currentRowIndex);
  for (const letter of requiredPresent) {
    if (!normalized.includes(letter)) {
      return true;
    }
  }

  return false;
}
