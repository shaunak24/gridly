import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';

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
  playAgainLabel?: string;
  onShare?: () => void;
  shareLabel?: string;
  modalDelayMs?: number;
  endFooter?: ReactNode;
  modalFooter?: ReactNode;
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
    footer?: ReactNode;
  };
  lossModalProps: {
    emoji: string;
    title: string;
    message: string;
    primaryLabel?: string;
    onPrimary?: () => void;
    onDismiss: () => void;
    footer?: ReactNode;
  };
}

export function useGameEndFlow({
  outcome,
  mode,
  message,
  onPlayAgain,
  onPractice,
  playAgainLabel: playAgainLabelOverride,
  onShare,
  shareLabel = 'Share',
  modalDelayMs = GAME_END_MODAL_DELAY_MS,
  endFooter,
  modalFooter,
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
  const playAgainLabel =
    playAgainLabelOverride ?? (isDailyFinished ? 'Practice' : 'Play again');
  const modalPrimaryLabel = showModalPrimary ? playAgainLabel : undefined;

  const endBarProps: GameEndBarProps = {
    message,
    onPlayAgain: barAction,
    playAgainLabel,
    onShare: outcome === 'won' && mode === 'daily' ? onShare : undefined,
    shareLabel: mode === 'daily' ? shareLabel : undefined,
    prominent: true,
    footer: endFooter,
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
      primaryLabel: modalPrimaryLabel,
      onPrimary: showModalPrimary ? wrapAction(onPlayAgain) : undefined,
      onDismiss: dismissModal,
      footer: modalFooter ?? endFooter,
    },
    lossModalProps: {
      ...GAME_END_LOSS_COPY,
      message,
      primaryLabel: modalPrimaryLabel,
      onPrimary: showModalPrimary ? wrapAction(onPlayAgain) : undefined,
      onDismiss: dismissModal,
      footer: modalFooter ?? endFooter,
    },
  };
}
