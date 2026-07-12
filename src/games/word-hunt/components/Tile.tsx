import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import type { TileState } from '../core/types';
import { useTheme } from '../../../shared/theme/useTheme';

interface TileProps {
  letter: string;
  state: TileState;
  isActive: boolean;
  delay?: number;
  size?: number;
}

function revealedBackground(
  state: TileState,
  theme: ReturnType<typeof useTheme>,
): string {
  switch (state) {
    case 'correct':
      return theme.teal;
    case 'present':
      return theme.amber;
    case 'absent':
      return theme.slate;
    default:
      return theme.tileEmpty;
  }
}

function frontBackground(
  state: TileState,
  isActive: boolean,
  hasLetter: boolean,
  theme: ReturnType<typeof useTheme>,
): string {
  if (state === 'filled' || (isActive && hasLetter)) {
    return theme.keyDefault;
  }
  return theme.tileEmpty;
}

export function Tile({ letter, state, isActive, delay = 0, size = 56 }: TileProps) {
  const theme = useTheme();
  const rotation = useSharedValue(0);
  const revealed = state === 'correct' || state === 'present' || state === 'absent';
  const hasLetter = letter.length > 0;
  const fontSize = Math.round(size * 0.43);
  const borderRadius = Math.max(4, Math.round(size * 0.11));

  useEffect(() => {
    if (revealed) {
      rotation.value = withDelay(delay, withTiming(180, { duration: 300 }));
    } else {
      rotation.value = 0;
    }
  }, [revealed, delay, rotation]);

  const frontStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 800 }, { rotateX: `${rotation.value}deg` }],
    backfaceVisibility: 'hidden',
  }));

  const backStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 800 }, { rotateX: `${rotation.value + 180}deg` }],
    backfaceVisibility: 'hidden',
  }));

  const textColor =
    state === 'empty' && !hasLetter ? theme.textSecondary : theme.textPrimary;

  if (!revealed) {
    return (
      <View
        style={[
          styles.tile,
          {
            width: size,
            height: size,
            borderRadius,
            backgroundColor: frontBackground(state, isActive, hasLetter, theme),
            borderColor: theme.border,
          },
        ]}
      >
        <Text style={[styles.letter, { fontSize, color: textColor }]}>{letter}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.flipContainer, { width: size, height: size }]}>
      <Animated.View
        style={[
          styles.tile,
          styles.face,
          {
            width: size,
            height: size,
            borderRadius,
            backgroundColor: theme.keyDefault,
            borderColor: theme.border,
          },
          frontStyle,
        ]}
      >
        <Text style={[styles.letter, { fontSize, color: theme.textPrimary }]}>{letter}</Text>
      </Animated.View>
      <Animated.View
        style={[
          styles.tile,
          styles.face,
          {
            width: size,
            height: size,
            borderRadius,
            backgroundColor: revealedBackground(state, theme),
            borderColor: theme.border,
          },
          backStyle,
        ]}
      >
        <Text style={[styles.letter, { fontSize, color: theme.textPrimary }]}>{letter}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  flipContainer: {},
  tile: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  face: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  letter: {
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
