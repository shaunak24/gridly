import { playGameEndSound } from '../services/gameEndSound';

/** Long enough to see the finished board, short enough not to feel like a wait. */
export const GAME_END_MODAL_DELAY_MS = 1100;

export type GameEndOutcome = 'playing' | 'won' | 'lost';
export type GameEndMode = 'daily' | 'practice' | 'custom' | 'campaign';

export const GAME_END_WIN_COPY = {
  emoji: '🎉',
  title: 'You got it!',
} as const;

export const GAME_END_LOSS_COPY = {
  emoji: '😔',
  title: 'Nice try',
} as const;

export type GameEndPresentation = 'won' | 'lost';

/**
 * Central hook for win/loss presentation side effects (sound, haptics, analytics).
 * Wire new feedback here so every game picks it up automatically.
 */
export function onGameEndPresented(presentation: GameEndPresentation): void {
  void playGameEndSound(presentation);
}
