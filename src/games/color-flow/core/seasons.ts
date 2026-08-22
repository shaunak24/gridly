export interface SeasonDef {
  id: string;
  title: string;
  levelCount: number;
  curveId: string;
}

export const SEASON_1_ID = 's1';

export const COLOR_FLOW_SEASONS: SeasonDef[] = [
  {
    id: SEASON_1_ID,
    title: 'Season 1',
    levelCount: 100,
    curveId: 's1-curve',
  },
];

export const COLOR_FLOW_REACHES: { fromLevel: number; title: string }[] = [
  { fromLevel: 1, title: 'Still Waters' },
  { fromLevel: 21, title: 'Crosswinds' },
  { fromLevel: 41, title: 'Rapids' },
  { fromLevel: 61, title: 'Deep Run' },
  { fromLevel: 81, title: 'The Source' },
];

export function getSeasonById(seasonId: string): SeasonDef | undefined {
  return COLOR_FLOW_SEASONS.find((season) => season.id === seasonId);
}

export function reachTitleForLevel(level: number): string {
  let title = COLOR_FLOW_REACHES[0].title;
  for (const reach of COLOR_FLOW_REACHES) {
    if (level >= reach.fromLevel) {
      title = reach.title;
    }
  }
  return title;
}
