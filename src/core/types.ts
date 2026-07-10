export type TileState = 'empty' | 'filled' | 'correct' | 'present' | 'absent';

export type GameMode = 'daily' | 'practice' | 'custom';

export type GameStatus = 'idle' | 'playing' | 'won' | 'lost';

export type LetterState = 'default' | 'correct' | 'present' | 'absent';

export interface ScoredTile {
  letter: string;
  state: Exclude<TileState, 'empty' | 'filled'>;
}

export interface GuessRow {
  letters: string[];
  states: TileState[];
}

export const WORD_LENGTH = 5;
export const MAX_GUESSES = 6;
