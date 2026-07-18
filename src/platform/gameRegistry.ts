import type { ComponentType } from 'react';

import { GridSnapIcon } from '../games/grid-snap/components/GridSnapIcon';
import { WordHuntIcon } from '../games/word-hunt/components/WordHuntIcon';

export interface GameIconProps {
  size?: number;
}

export interface GameDefinition {
  id: string;
  title: string;
  tagline: string;
  hubRoute: '/games/word-hunt' | '/games/grid-snap';
  Icon: ComponentType<GameIconProps>;
}

export const GAMES: GameDefinition[] = [
  {
    id: 'word-hunt',
    title: 'Word Hunt',
    tagline: 'Guess the word in six tries',
    hubRoute: '/games/word-hunt',
    Icon: WordHuntIcon,
  },
  {
    id: 'grid-snap',
    title: 'Grid Snap',
    tagline: 'Connect the pieces',
    hubRoute: '/games/grid-snap',
    Icon: GridSnapIcon,
  },
];

export function getGameById(id: string): GameDefinition | undefined {
  return GAMES.find((game) => game.id === id);
}
