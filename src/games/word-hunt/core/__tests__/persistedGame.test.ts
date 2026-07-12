import type { PersistedGame } from '../persistedGame';
import { toPersistedGame } from '../persistedGame';
import { getLocalDateKey } from '../dailyWord';

describe('toPersistedGame', () => {
  const base = {
    mode: 'practice' as const,
    dateKey: '',
    secretWord: 'HELLO',
    guesses: [],
    currentGuess: 'TE',
    currentRowIndex: 2,
    letterStates: {},
  };

  it('returns null when game is not in progress', () => {
    expect(toPersistedGame({ ...base, status: 'won' })).toBeNull();
    expect(toPersistedGame({ ...base, status: 'idle', secretWord: '' })).toBeNull();
  });

  it('serializes an in-progress game', () => {
    const saved = toPersistedGame({ ...base, status: 'playing' });
    expect(saved).toMatchObject({
      mode: 'practice',
      status: 'playing',
      secretWord: 'HELLO',
      currentGuess: 'TE',
      currentRowIndex: 2,
    });
  });
});

describe('daily persistence date key', () => {
  it('uses local date key format', () => {
    const key = getLocalDateKey(new Date(2026, 6, 4));
    expect(key).toBe('2026-07-04');
  });
});

describe('PersistedGame shape', () => {
  it('stores daily date key', () => {
    const game: PersistedGame = {
      mode: 'daily',
      dateKey: '2026-07-04',
      status: 'playing',
      secretWord: 'CRANE',
      guesses: [],
      currentGuess: '',
      currentRowIndex: 1,
      letterStates: {},
    };
    expect(game.dateKey).toBe('2026-07-04');
  });
});
