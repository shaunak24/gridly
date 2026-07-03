import type { GuessRow } from './types';
import { getDailyPuzzleNumber } from './dailyWord';

const TILE_EMOJI: Record<string, string> = {
  correct: '🟦',
  present: '🟨',
  absent: '⬛',
};

export function formatShareGrid(
  guesses: GuessRow[],
  guessCount: number,
  won: boolean,
  mode: 'daily' | 'practice',
  date: Date = new Date(),
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

  const header =
    mode === 'daily'
      ? `Gridly Daily ${getDailyPuzzleNumber(date)} ${won ? guessCount : 'X'}/6`
      : `Gridly Practice ${won ? guessCount : 'X'}/6`;

  return [header, '', ...rows].join('\n');
}
