import { create } from 'zustand';

import {
  applyDragTo,
  beginDragAt,
  createInitialState,
  recomputeState,
  resetBoard as resetBoardPaths,
  sanitizeSavedPaths,
} from '../core/flowEngine';
import { getLevelBoard } from '../core/levelBank';
import { levelSpecForSeason } from '../core/levelCurve';
import { getDailyBoard, getPracticeBoard } from '../core/puzzleBank';
import { getLocalDateKey, getPracticeSeed } from '../core/dailyPuzzle';
import {
  savedLevelSpecMatches,
  shouldResumeSavedColorFlowGame,
  isInMemoryColorFlowResumable,
} from '../core/sessionPolicy';
import type {
  FlowBoard,
  FlowDifficulty,
  FlowGameState,
  FlowMode,
  FlowStatus,
  LevelSpec,
  PersistedFlowGame,
  Point,
} from '../core/types';
import { loadJson, removeKey, saveJson, storageKeys } from '../../../shared/services/storage';
import { timeLimitSecForDifficulty, timeLimitSecForLevelSpec } from '../core/timeLimit';
import { useColorFlowCampaignStore } from './colorFlowCampaignStore';
import { useColorFlowSettingsStore } from './colorFlowSettingsStore';
import { useColorFlowStatsStore } from './colorFlowStatsStore';

export interface CampaignStartParams {
  seasonId: string;
  level: number;
}

interface ColorFlowGameState {
  status: FlowStatus;
  mode: FlowMode;
  difficulty: FlowDifficulty;
  dateKey: string;
  seasonId: string;
  level: number;
  levelSpec: LevelSpec | null;
  timeLimitSec: number;
  board: FlowBoard | null;
  gameState: FlowGameState | null;
  activeColorId: string | null;
  gameSessionId: number;
  dailyInProgress: boolean;
  practiceInProgress: boolean;
  campaignInProgress: boolean;
  elapsedSec: number;
  hydrateProgress: () => Promise<void>;
  resumeOrStartGame: (mode: FlowMode, campaign?: CampaignStartParams) => Promise<boolean>;
  startGame: (mode: FlowMode, campaign?: CampaignStartParams) => Promise<void>;
  setElapsedSec: (elapsedSec: number) => void;
  beginDrag: (point: Point) => string | null;
  extendDrag: (colorId: string, from: Point | null, to: Point) => void;
  commitDrag: () => void;
  resetBoard: () => void;
  handleTimeUp: () => void;
  persistSession: () => Promise<void>;
}

function storageKeyForMode(mode: FlowMode): string {
  if (mode === 'daily') {
    return storageKeys.colorFlowSavedDaily;
  }
  if (mode === 'campaign') {
    return storageKeys.colorFlowSavedCampaign;
  }
  return storageKeys.colorFlowSavedPractice;
}

function isValidSavedGame(saved: PersistedFlowGame | null): saved is PersistedFlowGame {
  return Boolean(saved && saved.board && saved.board.pairs.length > 0);
}

function difficultyForLevelSpec(spec: LevelSpec): FlowDifficulty {
  if (spec.gridSize <= 4) {
    return 'easy';
  }
  if (spec.gridSize <= 6) {
    return 'medium';
  }
  return 'hard';
}

async function reconcileStaleCampaignSave(): Promise<void> {
  const saved = await loadJson<PersistedFlowGame>(storageKeys.colorFlowSavedCampaign);
  if (!isValidSavedGame(saved) || saved.mode !== 'campaign' || saved.status !== 'playing') {
    return;
  }

  if (!saved.seasonId || !saved.level) {
    await removeKey(storageKeys.colorFlowSavedCampaign);
    return;
  }

  await useColorFlowCampaignStore.getState().hydrate();
  const playable = useColorFlowCampaignStore
    .getState()
    .isLevelPlayable(saved.seasonId, saved.level);
  if (!playable) {
    await removeKey(storageKeys.colorFlowSavedCampaign);
  }
}

async function refreshProgressFlags(set: (partial: Partial<ColorFlowGameState>) => void): Promise<void> {
  await reconcileStaleCampaignSave();
  const [dailyInProgress, practiceInProgress, campaignInProgress] = await Promise.all([
    loadJson<PersistedFlowGame>(storageKeys.colorFlowSavedDaily).then(
      (game) => isValidSavedGame(game) && game.status === 'playing',
    ),
    loadJson<PersistedFlowGame>(storageKeys.colorFlowSavedPractice).then(
      (game) => isValidSavedGame(game) && game.status === 'playing',
    ),
    loadJson<PersistedFlowGame>(storageKeys.colorFlowSavedCampaign).then(
      (game) => isValidSavedGame(game) && game.status === 'playing',
    ),
  ]);
  set({
    dailyInProgress: Boolean(dailyInProgress),
    practiceInProgress: Boolean(practiceInProgress),
    campaignInProgress: Boolean(campaignInProgress),
  });
}

async function persistIfPlaying(state: ColorFlowGameState): Promise<void> {
  if (!state.board || !state.gameState || state.status !== 'playing') {
    return;
  }

  const snapshot: PersistedFlowGame = {
    mode: state.mode,
    dateKey: state.dateKey,
    difficulty: state.difficulty,
    board: state.board,
    paths: state.gameState.paths,
    status: state.status,
    elapsedSec: state.elapsedSec,
    activeColorId: state.activeColorId,
    seasonId: state.seasonId || undefined,
    level: state.level || undefined,
    levelSpec: state.levelSpec ?? undefined,
    timeLimitSec: state.timeLimitSec,
  };

  await saveJson(storageKeyForMode(state.mode), snapshot);
}

export const useColorFlowStore = create<ColorFlowGameState>((set, get) => ({
  status: 'idle',
  mode: 'practice',
  difficulty: 'easy',
  dateKey: '',
  seasonId: '',
  level: 0,
  levelSpec: null,
  timeLimitSec: 300,
  board: null,
  gameState: null,
  activeColorId: null,
  gameSessionId: 0,
  dailyInProgress: false,
  practiceInProgress: false,
  campaignInProgress: false,
  elapsedSec: 0,

  hydrateProgress: async () => {
    await refreshProgressFlags(set);
  },

  resumeOrStartGame: async (mode, campaign) => {
    await useColorFlowSettingsStore.getState().ensureHydrated();
    if (mode === 'campaign') {
      await useColorFlowCampaignStore.getState().hydrate();
    }

    const selectedDifficulty = useColorFlowSettingsStore.getState().difficulty;
    const todayDateKey = getLocalDateKey();
    const campaignSeasonId = campaign?.seasonId;
    const campaignLevel = campaign?.level;

    const current = get();
    if (
      isInMemoryColorFlowResumable(
        current,
        mode,
        selectedDifficulty,
        todayDateKey,
        campaignSeasonId,
        campaignLevel,
      )
    ) {
      applyTimeExpiredIfNeeded(get, set);
      await persistIfPlaying(current);
      return true;
    }

    if (mode === 'daily' && useColorFlowStatsStore.getState().isDailyCompleteToday()) {
      const saved = await loadJson<PersistedFlowGame>(storageKeys.colorFlowSavedDaily);
      if (!isValidSavedGame(saved) || saved.status !== 'playing') {
        return false;
      }
    }

    const saved = await loadJson<PersistedFlowGame>(storageKeyForMode(mode));
    if (isValidSavedGame(saved) && saved.status === 'playing') {
      if (
        shouldResumeSavedColorFlowGame({
          saved,
          mode,
          selectedDifficulty,
          todayDateKey,
          campaignSeasonId,
          campaignLevel,
        })
      ) {
        const gameState = recomputeFromSaved(saved);
        set({
          status: 'playing',
          mode,
          difficulty: saved.difficulty,
          dateKey: saved.dateKey,
          seasonId: saved.seasonId ?? '',
          level: saved.level ?? 0,
          levelSpec: saved.levelSpec ?? null,
          timeLimitSec: saved.timeLimitSec ?? timeLimitSecForDifficulty(saved.difficulty),
          board: saved.board,
          gameState,
          activeColorId: saved.activeColorId,
          gameSessionId: get().gameSessionId + 1,
          elapsedSec: saved.elapsedSec ?? 0,
        });
        applyTimeExpiredIfNeeded(get, set);
        await refreshProgressFlags(set);
        return true;
      }

      await removeKey(storageKeyForMode(mode));
    } else if (saved) {
      await removeKey(storageKeyForMode(mode));
    }

    if (mode === 'daily' && useColorFlowStatsStore.getState().isDailyCompleteToday()) {
      return false;
    }

    if (mode === 'campaign' && campaign) {
      const playable = useColorFlowCampaignStore.getState().isLevelPlayable(campaign.seasonId, campaign.level);
      if (!playable) {
        return false;
      }
    }

    await get().startGame(mode, campaign);
    return true;
  },

  startGame: async (mode, campaign) => {
    await useColorFlowSettingsStore.getState().ensureHydrated();
    const difficulty = useColorFlowSettingsStore.getState().difficulty;

    await removeKey(storageKeyForMode(mode));
    const dateKey = mode === 'daily' ? getLocalDateKey() : '';

    let board: FlowBoard;
    let levelSpec: LevelSpec | null = null;
    let timeLimitSec = timeLimitSecForDifficulty(difficulty);
    let seasonId = '';
    let level = 0;
    let activeDifficulty = difficulty;

    if (mode === 'campaign' && campaign) {
      levelSpec = levelSpecForSeason(campaign.seasonId, campaign.level);
      board = getLevelBoard(campaign.seasonId, campaign.level);
      timeLimitSec = timeLimitSecForLevelSpec(levelSpec);
      seasonId = campaign.seasonId;
      level = campaign.level;
      activeDifficulty = difficultyForLevelSpec(levelSpec);
    } else if (mode === 'daily') {
      board = getDailyBoard(dateKey);
      activeDifficulty = 'medium';
      timeLimitSec = timeLimitSecForDifficulty('medium');
    } else {
      board = getPracticeBoard(getPracticeSeed(), difficulty);
    }

    const gameState = createInitialState(board);

    set({
      status: 'playing',
      mode,
      difficulty: activeDifficulty,
      dateKey,
      seasonId,
      level,
      levelSpec,
      timeLimitSec,
      board,
      gameState,
      activeColorId: null,
      gameSessionId: get().gameSessionId + 1,
      elapsedSec: 0,
    });

    await persistIfPlaying(get());
    await refreshProgressFlags(set);
  },

  setElapsedSec: (elapsedSec) => set({ elapsedSec }),

  beginDrag: (point) => {
    const state = get();
    if (!state.board || !state.gameState || state.status !== 'playing') {
      return null;
    }

    const { state: nextGameState, colorId } = beginDragAt(state.gameState, point);
    if (!colorId) {
      return null;
    }

    if (nextGameState !== state.gameState || state.activeColorId !== colorId) {
      set({ gameState: nextGameState, activeColorId: colorId });
    }
    return colorId;
  },

  extendDrag: (colorId, from, to) => {
    const state = get();
    if (!state.board || !state.gameState || state.status !== 'playing') {
      return;
    }

    const nextGameState = applyDragTo(state.gameState, colorId, from, to);
    if (nextGameState === state.gameState && state.activeColorId === colorId) {
      return;
    }

    const solved = nextGameState.isComplete;
    set({
      gameState: nextGameState,
      activeColorId: colorId,
      status: solved ? 'won' : 'playing',
    });

    if (solved) {
      void finishSolvedGame(get, set, state);
    }
  },

  commitDrag: () => {
    const state = get();
    if (state.status !== 'playing') {
      return;
    }
    void persistIfPlaying(state);
  },

  resetBoard: () => {
    const state = get();
    if (!state.gameState || state.status !== 'playing') {
      return;
    }

    const nextGameState = resetBoardPaths(state.gameState);
    if (nextGameState === state.gameState) {
      return;
    }

    set({ gameState: nextGameState, activeColorId: null });
    void persistIfPlaying({ ...get(), gameState: nextGameState });
  },

  handleTimeUp: () => {
    const state = get();
    if (state.status !== 'playing') {
      return;
    }

    set({ status: 'lost' });
    void finishLostGame(get, set, state);
  },

  persistSession: async () => {
    await persistIfPlaying(get());
  },
}));

async function finishLostGame(
  get: () => ColorFlowGameState,
  set: (partial: Partial<ColorFlowGameState>) => void,
  state: ColorFlowGameState,
): Promise<void> {
  await removeKey(storageKeyForMode(state.mode));
  await refreshProgressFlags(set);
  const stats = useColorFlowStatsStore.getState();
  await stats.recordResult(state.difficulty, state.mode, false, get().elapsedSec);
  if (state.mode === 'daily') {
    await stats.markDailyComplete();
  }
}

function applyTimeExpiredIfNeeded(
  get: () => ColorFlowGameState,
  set: (partial: Partial<ColorFlowGameState>) => void,
): void {
  const state = get();
  if (state.status !== 'playing') {
    return;
  }

  if (state.elapsedSec >= state.timeLimitSec) {
    set({ status: 'lost' });
    void finishLostGame(get, set, state);
  }
}

async function finishSolvedGame(
  get: () => ColorFlowGameState,
  set: (partial: Partial<ColorFlowGameState>) => void,
  state: ColorFlowGameState,
): Promise<void> {
  await removeKey(storageKeyForMode(state.mode));
  await refreshProgressFlags(set);
  const stats = useColorFlowStatsStore.getState();
  await stats.recordResult(state.difficulty, state.mode, true, get().elapsedSec);
  if (state.mode === 'daily') {
    await stats.markDailyComplete();
  }
  if (state.mode === 'campaign' && state.seasonId && state.level > 0) {
    await useColorFlowCampaignStore.getState().completeLevel(state.seasonId, state.level);
  }
}

function recomputeFromSaved(saved: PersistedFlowGame): FlowGameState {
  if (saved.mode === 'campaign' && saved.seasonId && saved.level) {
    const expectedSpec = levelSpecForSeason(saved.seasonId, saved.level);
    if (!savedLevelSpecMatches(saved, expectedSpec)) {
      return recomputeState({
        board: saved.board,
        paths: sanitizeSavedPaths(saved.board, saved.paths),
      });
    }
  }

  return recomputeState({
    board: saved.board,
    paths: sanitizeSavedPaths(saved.board, saved.paths),
  });
}
