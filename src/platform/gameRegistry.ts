export interface GameDefinition {
  id: string;
  title: string;
  tagline: string;
  hubRoute: '/games/word-hunt' | '/games/grid-snap';
}

export const GAMES: GameDefinition[] = [
  {
    id: 'word-hunt',
    title: 'Word Hunt',
    tagline: 'Guess the word in six tries',
    hubRoute: '/games/word-hunt',
  },
  {
    id: 'grid-snap',
    title: 'Grid Snap',
    tagline: 'Connect the pieces',
    hubRoute: '/games/grid-snap',
  },
];

export function getGameById(id: string): GameDefinition | undefined {
  return GAMES.find((game) => game.id === id);
}
