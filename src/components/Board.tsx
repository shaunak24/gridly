import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Tile } from './Tile';
import type { GuessRow } from '../core/types';
import { WORD_LENGTH } from '../core/types';

interface BoardProps {
  guesses: GuessRow[];
  currentGuess: string;
  currentRowIndex: number;
  shakeRow: boolean;
  onShakeComplete: () => void;
  compact?: boolean;
}

const TILE_SIZE_DEFAULT = 56;
const TILE_SIZE_COMPACT = 46;

export function Board({
  guesses,
  currentGuess,
  currentRowIndex,
  shakeRow,
  onShakeComplete,
  compact = false,
}: BoardProps) {
  const shakeX = useSharedValue(0);
  const tileSize = compact ? TILE_SIZE_COMPACT : TILE_SIZE_DEFAULT;
  const rowGap = compact ? 6 : 8;

  useEffect(() => {
    if (shakeRow) {
      shakeX.value = withSequence(
        withTiming(-8, { duration: 50 }),
        withTiming(8, { duration: 50 }),
        withTiming(-8, { duration: 50 }),
        withTiming(8, { duration: 50 }),
        withTiming(0, { duration: 50 }),
      );
      const timer = setTimeout(onShakeComplete, 260);
      return () => clearTimeout(timer);
    }
  }, [shakeRow, shakeX, onShakeComplete]);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  return (
    <View style={[styles.board, { gap: rowGap }]}>
      {guesses.map((row, rowIndex) => {
        const isActiveRow = rowIndex === currentRowIndex;
        const letters = isActiveRow
          ? currentGuess.padEnd(WORD_LENGTH, ' ').split('').map((c) => (c === ' ' ? '' : c))
          : row.letters;

        const states = isActiveRow
          ? letters.map((letter) => (letter ? 'filled' : 'empty'))
          : row.states;

        const rowContent = (
          <View style={[styles.row, { gap: rowGap }]}>
            {letters.map((letter, colIndex) => (
              <Tile
                key={`${rowIndex}-${colIndex}`}
                letter={letter}
                state={states[colIndex]}
                isActive={isActiveRow}
                delay={colIndex * 80}
                size={tileSize}
              />
            ))}
          </View>
        );

        if (isActiveRow) {
          return (
            <Animated.View key={`row-wrap-${rowIndex}`} style={shakeStyle}>
              {rowContent}
            </Animated.View>
          );
        }

        return <View key={`row-wrap-${rowIndex}`}>{rowContent}</View>;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
  },
});
