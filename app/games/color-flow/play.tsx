import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FlowBoardView } from '../../../src/games/color-flow/components/FlowBoard';
import { filledCellCount } from '../../../src/games/color-flow/core/flowEngine';
import { getSeasonById, SEASON_1_ID } from '../../../src/games/color-flow/core/seasons';
import type { FlowMode } from '../../../src/games/color-flow/core/types';
import { useColorFlowCampaignStore } from '../../../src/games/color-flow/stores/colorFlowCampaignStore';
import { useColorFlowStatsStore } from '../../../src/games/color-flow/stores/colorFlowStatsStore';
import { useColorFlowStore } from '../../../src/games/color-flow/stores/colorFlowStore';
import { GameEndExperience } from '../../../src/shared/components/GameEndExperience';
import { HeaderHomeButton } from '../../../src/shared/components/HeaderHomeButton';
import { HeaderTimer } from '../../../src/shared/components/HeaderTimer';
import { presentAppMessage } from '../../../src/shared/components/presentAppMessage';
import type { GameEndMode, GameEndOutcome } from '../../../src/shared/gameEnd/gameEndConfig';
import { useGameTimeLimit } from '../../../src/shared/hooks/useGameTimeLimit';
import { useMusicUrgency } from '../../../src/shared/hooks/useMusicUrgency';
import { useFlushGameSessionOnBlur } from '../../../src/shared/hooks/useFlushGameSessionOnBlur';
import { useHardwareBack } from '../../../src/shared/hooks/useHardwareBack';
import { useTheme } from '../../../src/shared/theme/useTheme';
import { formatElapsedSeconds } from '../../../src/shared/utils/formatElapsed';
import { success } from '../../../src/shared/utils/haptics';

function resolveMode(modeParam?: string): FlowMode {
  if (modeParam === 'daily') {
    return 'daily';
  }
  if (modeParam === 'campaign') {
    return 'campaign';
  }
  return 'practice';
}

function shouldContinue(continueParam?: string): boolean {
  return continueParam === '1';
}

function toEndMode(mode: FlowMode): GameEndMode {
  if (mode === 'campaign') {
    return 'campaign';
  }
  return mode;
}

export default function ColorFlowPlayScreen() {
  const router = useRouter();
  const theme = useTheme();
  const {
    mode: modeParam,
    continue: continueParam,
    season: seasonParam,
    level: levelParam,
  } = useLocalSearchParams<{
    mode?: string;
    continue?: string;
    season?: string;
    level?: string;
  }>();
  const mode = resolveMode(modeParam);
  const continueGame = shouldContinue(continueParam);
  const seasonId = seasonParam ?? SEASON_1_ID;
  const level = Math.max(1, Number.parseInt(levelParam ?? '1', 10) || 1);
  const backParent = mode === 'campaign' ? '/games/color-flow/journey' : '/games/color-flow';
  useHardwareBack(backParent);
  const season = getSeasonById(seasonId);
  const levelCount = season?.levelCount ?? 100;

  const status = useColorFlowStore((state) => state.status);
  const activeMode = useColorFlowStore((state) => state.mode);
  const activeSeasonId = useColorFlowStore((state) => state.seasonId);
  const activeLevel = useColorFlowStore((state) => state.level);
  const timeLimitSec = useColorFlowStore((state) => state.timeLimitSec);
  const gameSessionId = useColorFlowStore((state) => state.gameSessionId);
  const elapsedSec = useColorFlowStore((state) => state.elapsedSec);
  const board = useColorFlowStore((state) => state.board);
  const gameState = useColorFlowStore((state) => state.gameState);
  const activeColorId = useColorFlowStore((state) => state.activeColorId);
  const setElapsedSec = useColorFlowStore((state) => state.setElapsedSec);
  const resumeOrStartGame = useColorFlowStore((state) => state.resumeOrStartGame);
  const startGame = useColorFlowStore((state) => state.startGame);
  const beginDrag = useColorFlowStore((state) => state.beginDrag);
  const extendDrag = useColorFlowStore((state) => state.extendDrag);
  const commitDrag = useColorFlowStore((state) => state.commitDrag);
  const resetBoard = useColorFlowStore((state) => state.resetBoard);
  const handleTimeUp = useColorFlowStore((state) => state.handleTimeUp);
  const persistSession = useColorFlowStore((state) => state.persistSession);

  const campaignParams = useMemo(
    () => (mode === 'campaign' ? { seasonId, level } : undefined),
    [mode, seasonId, level],
  );

  const getBaseElapsedSec = useCallback(() => useColorFlowStore.getState().elapsedSec, []);
  const { remainingDisplay, remainingSec } = useGameTimeLimit({
    active: status === 'playing',
    resetKey: gameSessionId,
    getBaseElapsedSec,
    onTick: setElapsedSec,
    limitSec: timeLimitSec,
    onTimeUp: handleTimeUp,
  });

  useMusicUrgency({ active: status === 'playing', remainingSec });

  useEffect(() => {
    const init = async () => {
      const store = useColorFlowStore.getState();
      if (
        mode === 'campaign' &&
        !continueGame &&
        store.mode === 'campaign' &&
        store.seasonId === seasonId &&
        store.level === level &&
        store.status === 'playing'
      ) {
        return;
      }

      if (mode === 'daily' && useColorFlowStatsStore.getState().isDailyCompleteToday()) {
        const started = await resumeOrStartGame('daily');
        if (!started) {
          router.replace('/games/color-flow');
        }
        return;
      }

      if (mode === 'campaign') {
        const campaignStore = useColorFlowCampaignStore.getState();
        if (!campaignStore.hydrated) {
          await campaignStore.hydrate();
        }
        if (!continueGame) {
          const playable = campaignStore.isLevelPlayable(seasonId, level);
          if (!playable) {
            router.replace('/games/color-flow/journey');
            return;
          }
        }
      }

      if (continueGame) {
        const started = await resumeOrStartGame(mode, campaignParams);
        if (!started && mode === 'campaign') {
          await startGame(mode, campaignParams);
        }
        return;
      }

      await startGame(mode, campaignParams);
    };

    void init();
  }, [mode, continueGame, seasonId, level, campaignParams, resumeOrStartGame, startGame, router]);

  useFlushGameSessionOnBlur(persistSession);

  useEffect(() => {
    if (status === 'won') {
      success();
    }
  }, [status]);

  const goHome = useCallback(() => {
    void persistSession();
    if (mode === 'campaign') {
      router.replace('/games/color-flow/journey');
      return;
    }
    router.replace('/games/color-flow');
  }, [router, persistSession, mode]);

  const handlePractice = useCallback(() => {
    router.replace({ pathname: '/games/color-flow/play', params: { mode: 'practice' } });
  }, [router]);

  const handlePlayAgain = useCallback(() => {
    if (activeMode === 'campaign') {
      void startGame('campaign', { seasonId: activeSeasonId, level: activeLevel });
      return;
    }
    void startGame(activeMode);
  }, [startGame, activeMode, activeSeasonId, activeLevel]);

  const handleNextLevel = useCallback(() => {
    const nextLevel = activeLevel + 1;
    if (nextLevel > levelCount) {
      router.replace('/games/color-flow/journey');
      return;
    }
    void startGame('campaign', { seasonId: activeSeasonId, level: nextLevel });
  }, [activeLevel, activeSeasonId, levelCount, router, startGame]);

  const handleBackToMap = useCallback(() => {
    router.replace('/games/color-flow/journey');
  }, [router]);

  const handleReset = useCallback(() => {
    presentAppMessage({
      title: 'Reset board?',
      body: 'This clears every flow you have drawn. The puzzle and timer stay the same.',
      emoji: '🧹',
      primaryLabel: 'Reset',
      onPrimary: resetBoard,
      secondaryLabel: 'Cancel',
    });
  }, [resetBoard]);

  const outcome: GameEndOutcome =
    status === 'won' ? 'won' : status === 'lost' ? 'lost' : 'playing';

  const headerLabel =
    mode === 'daily' ? 'Daily' : mode === 'campaign' ? `Level ${activeLevel || level}` : 'Practice';

  const canReset = status === 'playing' && Boolean(gameState) && filledCellCount(gameState!.paths) > 0;
  const endMessage =
    outcome === 'won' ? 'Flow complete!' : outcome === 'lost' ? "Time's up" : '';

  const timerDisplay =
    status === 'playing'
      ? remainingDisplay
      : formatElapsedSeconds(Math.min(elapsedSec, timeLimitSec));

  const campaignWin = mode === 'campaign' && outcome === 'won';
  const hasNextLevel = activeLevel < levelCount;
  const endPrimaryAction = campaignWin && hasNextLevel ? handleNextLevel : handlePlayAgain;
  const endPrimaryLabel = campaignWin && hasNextLevel ? 'Next level' : 'Try again';

  const endFooter =
    mode === 'campaign' && outcome !== 'playing' ? (
      <Pressable
        style={({ pressed }) => [styles.mapLink, pressed && styles.pressed]}
        onPress={handleBackToMap}
      >
        <Text style={[styles.mapLinkText, { color: theme.textSecondary }]}>Back to map</Text>
      </Pressable>
    ) : undefined;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <HeaderHomeButton onPress={goHome} />
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>{headerLabel}</Text>
        <HeaderTimer
          display={timerDisplay}
          variant={status === 'playing' ? 'countdown' : 'elapsed'}
        />
      </View>

      <View style={styles.boardArea}>
        {board && gameState ? (
          <FlowBoardView
            key={gameSessionId}
            board={board}
            gameState={gameState}
            activeColorId={activeColorId}
            isPlaying={status === 'playing'}
            onBeginDrag={beginDrag}
            onExtendDrag={extendDrag}
            onCommitDrag={commitDrag}
          />
        ) : null}
      </View>

      {canReset ? (
        <Pressable
          style={({ pressed }) => [
            styles.resetButton,
            { backgroundColor: theme.card, borderColor: theme.border },
            pressed && styles.pressed,
          ]}
          onPress={handleReset}
          accessibilityRole="button"
          accessibilityLabel="Reset board"
        >
          <Text style={[styles.resetText, { color: theme.textPrimary }]}>Reset board</Text>
        </Pressable>
      ) : null}

      <GameEndExperience
        outcome={outcome}
        mode={toEndMode(mode)}
        message={endMessage}
        onPlayAgain={endPrimaryAction}
        playAgainLabel={endPrimaryLabel}
        onPractice={mode === 'daily' ? handlePractice : undefined}
        endFooter={endFooter}
        modalFooter={endFooter}
        endAreaStyle={styles.endArea}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 12, paddingBottom: 8 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  boardArea: { flex: 1, minHeight: 0, justifyContent: 'center' },
  resetButton: {
    alignSelf: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
    minHeight: 40,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetText: { fontSize: 14, fontWeight: '600' },
  mapLink: {
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  mapLinkText: { fontSize: 15, fontWeight: '600' },
  pressed: { opacity: 0.85 },
  endArea: {
    flex: 0,
    justifyContent: 'flex-start',
    paddingTop: 8,
    paddingBottom: 16,
  },
});
