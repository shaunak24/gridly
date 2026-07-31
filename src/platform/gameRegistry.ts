import type { ComponentType } from 'react';

import { ColorFlowIcon } from '../games/color-flow/components/ColorFlowIcon';
import { GridSnapIcon } from '../games/grid-snap/components/GridSnapIcon';
import { WordHuntIcon } from '../games/word-hunt/components/WordHuntIcon';

export interface GameIconProps {
  size?: number;
}

export interface GameDefinition {
  id: string;
  title: string;
  tagline: string;
  hubRoute: '/games/word-hunt' | '/games/grid-snap' | '/games/color-flow';
  Icon: ComponentType<GameIconProps>;
}

/** Order here drives the home screen game list. */
export const GAMES: GameDefinition[] = [
  {
    id: 'color-flow',
    title: 'Color Flow',
    tagline: 'Connect the dots. Fill the grid.',
    hubRoute: '/games/color-flow',
    Icon: ColorFlowIcon,
  },
  {
    id: 'grid-snap',
    title: 'Grid Snap',
    tagline: 'Connect the pieces',
    hubRoute: '/games/grid-snap',
    Icon: GridSnapIcon,
  },
  {
    id: 'word-hunt',
    title: 'Word Hunt',
    tagline: 'Guess the word in six tries',
    hubRoute: '/games/word-hunt',
    Icon: WordHuntIcon,
  },
];

export function getGameById(id: string): GameDefinition | undefined {
  return GAMES.find((game) => game.id === id);
}
