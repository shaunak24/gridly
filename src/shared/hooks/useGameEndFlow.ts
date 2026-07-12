import { useCallback, useEffect, useRef, useState } from 'react';

import {
  GAME_END_LOSS_COPY,
  GAME_END_MODAL_DELAY_MS,
  GAME_END_WIN_COPY,
  onGameEndPresented,
  type GameEndMode,
  type GameEndOutcome,
} from '../gameEnd/gameEndConfig';
import type { GameEndBarProps } from '../components/GameEndBar';

export interface UseGameEndFlowOptions {
  outcome: GameEndOutcome;
  mode: GameEndMode;
  message: string;
  onPlayAgain: () => void;
  onPractice?: () => void;
  onShare?: () => void;
  shareLabel?: string;
  modalDelayMs?: number;
}

export interface UseGameEndFlowResult {
  isFinished: boolean;
  isPlaying: boolean;
  endBarProps: GameEndBarProps;
  winModalVisible: boolean;
  lossModalVisible: boolean;
  dismissModal: () => void;
  winModalProps: {
    emoji: string;
    title: string;
    message: string;
    primaryLabel?: string;
    onPrimary?: () => void;
    onDismiss: () => void;
  };
  lossModalProps: {
    emoji: string;
    title: string;
    message: string;
    primaryLabel?: string;
    onPrimary?: () => void;
    onDismiss: () => void;
  };
}

export function useGameEndFlow({
  outcome,
  mode,
  message,
  onPlayAgain,
  onPractice,
  onShare,
  shareLabel = 'Share',
  modalDelayMs = GAME_END_MODAL_DELAY_MS,
}: UseGameEndFlowOptions): UseGameEndFlowResult {
  const [modalVisible, setModalVisible] = useState(false);
  const lastPresentedRef = useRef<GameEndOutcome | null>(null);

  const isFinished = outcome === 'won' || outcome === 'lost';
  const isPlaying = outcome === 'playing';
  const isDailyFinished = mode === 'daily' && isFinished;
  const showModalPrimary = mode !== 'daily';

  useEffect(() => {
    if (!isFinished) {
      setModalVisible(false);
      lastPresentedRef.current = null;
      return;
    }

    setModalVisible(false);
    const timer = setTimeout(() => setModalVisible(true), modalDelayMs);
    return () => clearTimeout(timer);
  }, [outcome, isFinished, modalDelayMs]);

  useEffect(() => {
    if (!modalVisible || !isFinished) {
      return;
    }
    if (lastPresentedRef.current === outcome) {
      return;
    }

    lastPresentedRef.current = outcome;
    if (outcome === 'won' || outcome === 'lost') {
      onGameEndPresented(outcome);
    }
  }, [modalVisible, isFinished, outcome]);

  const dismissModal = useCallback(() => {
    setModalVisible(false);
  }, []);

  const wrapAction = useCallback(
    (action: () => void) => () => {
      setModalVisible(false);
      action();
    },
    [],
  );

  const barAction =
    isDailyFinished && onPractice ? wrapAction(onPractice) : wrapAction(onPlayAgain);
  const playAgainLabel = isDailyFinished ? 'Practice' : 'Play again';
  const modalPrimaryAction = showModalPrimary ? wrapAction(onPlayAgain) : undefined;

  const endBarProps: GameEndBarProps = {
    message,
    onPlayAgain: barAction,
    playAgainLabel,
    onShare: outcome === 'won' && mode === 'daily' ? onShare : undefined,
    shareLabel: mode === 'daily' ? shareLabel : undefined,
    prominent: true,
  };

  return {
    isFinished,
    isPlaying,
    endBarProps,
    winModalVisible: outcome === 'won' && modalVisible,
    lossModalVisible: outcome === 'lost' && modalVisible,
    dismissModal,
    winModalProps: {
      ...GAME_END_WIN_COPY,
      message,
      primaryLabel: showModalPrimary ? 'Play again' : undefined,
      onPrimary: modalPrimaryAction,
      onDismiss: dismissModal,
    },
    lossModalProps: {
      ...GAME_END_LOSS_COPY,
      message,
      primaryLabel: showModalPrimary ? 'Play again' : undefined,
      onPrimary: modalPrimaryAction,
      onDismiss: dismissModal,
    },
  };
}
