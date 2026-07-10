import type { GuessRow } from './types';
import { getDailyPuzzleNumber } from './dailyWord';

const TILE_EMOJI: Record<string, string> = {
  correct: '🟦',
  present: '🟨',
  absent: '⬛',
};

function formatShareDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatShareGrid(
  guesses: GuessRow[],
  guessCount: number,
  won: boolean,
  mode: 'daily' | 'practice' | 'custom',
  date: Date = new Date(),
  secretWord = '',
): string {
  const rows = guesses
    .filter((row) => row.states.some((s) => s === 'correct' || s === 'present' || s === 'absent'))
    .map((row) =>
      row.states
        .map((state) => {
          if (state === 'correct' || state === 'present' || state === 'absent') {
            return TILE_EMOJI[state];
          }
          return '⬛';
        })
        .join(''),
    );

  const attempts = won ? `${guessCount}/6` : 'X/6';
  const answer = secretWord.toUpperCase();

  const header =
    mode === 'daily'
      ? `Gridly Daily #${getDailyPuzzleNumber(date)} · ${formatShareDate(date)}`
      : mode === 'custom'
        ? 'Gridly Custom Puzzle'
        : 'Gridly Practice';

  const meta = answer ? `${attempts} · ${answer}` : attempts;

  return [header, meta, '', ...rows].join('\n');
}
