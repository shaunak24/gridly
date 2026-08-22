import { create } from 'zustand';

import { getSeasonById } from '../core/seasons';
import {
  completeCampaignLevel,
  emptyColorFlowCampaignProgress,
  isCampaignLevelCompleted,
  isCampaignLevelPlayable,
  type ColorFlowCampaignProgress,
} from '../../../shared/stats/colorFlowModeStats';
import { useColorFlowStatsStore } from './colorFlowStatsStore';

interface ColorFlowCampaignState {
  progress: ColorFlowCampaignProgress;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  getProgress: () => ColorFlowCampaignProgress;
  getCurrentLevel: (seasonId: string) => number;
  isLevelPlayable: (seasonId: string, level: number) => boolean;
  isLevelCompleted: (seasonId: string, level: number) => boolean;
  completeLevel: (seasonId: string, level: number) => Promise<void>;
  setActiveSeason: (seasonId: string) => Promise<void>;
}

export const useColorFlowCampaignStore = create<ColorFlowCampaignState>((set, get) => ({
  progress: emptyColorFlowCampaignProgress(),
  hydrated: false,

  hydrate: async () => {
    await useColorFlowStatsStore.getState().hydrate();
    const stats = useColorFlowStatsStore.getState();
    const campaign = stats.getCampaignProgress();
    set({ progress: campaign, hydrated: true });
  },

  getProgress: () => get().progress,

  getCurrentLevel: (seasonId) => {
    const season = get().progress.seasons[seasonId];
    return season?.highestUnlocked ?? 1;
  },

  isLevelPlayable: (seasonId, level) => isCampaignLevelPlayable(get().progress, seasonId, level),

  isLevelCompleted: (seasonId, level) => isCampaignLevelCompleted(get().progress, seasonId, level),

  completeLevel: async (seasonId, level) => {
    const season = getSeasonById(seasonId);
    const levelCount = season?.levelCount ?? 100;
    const next = completeCampaignLevel(get().progress, seasonId, level, levelCount);
    set({ progress: next });
    await useColorFlowStatsStore.getState().setCampaignProgress(next);
  },

  setActiveSeason: async (seasonId) => {
    const progress = {
      ...get().progress,
      activeSeasonId: seasonId,
    };
    set({ progress });
    await useColorFlowStatsStore.getState().setCampaignProgress(progress);
  },
}));
