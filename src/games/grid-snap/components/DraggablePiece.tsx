import { useMemo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  type SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';

import { getPieceXY } from '../core/puzzleEngine';
import { IS_TEST_MODE, tileNumber } from '../core/testMode';
import type { Piece } from '../core/types';
import { useTheme } from '../../../shared/theme/useTheme';

const TEST_TILE_COLORS = ['#0EA5E9', '#22C55E', '#F97316', '#A855F7', '#EF4444', '#14B8A6'];

interface DraggablePieceProps {
  piece: Piece;
  imageUrl: string;
  rows: number;
  cols: number;
  pieceSize: number;
  activeGroupId: SharedValue<string>;
  dragX: SharedValue<number>;
  dragY: SharedValue<number>;
  onDragEnd: (pieceId: string, dx: number, dy: number) => void;
  disabled?: boolean;
}

export function DraggablePiece({
  piece,
  imageUrl,
  rows,
  cols,
  pieceSize,
  activeGroupId,
  dragX,
  dragY,
  onDragEnd,
  disabled = false,
}: DraggablePieceProps) {
  const theme = useTheme();
  const { x, y } = getPieceXY(piece, pieceSize);

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .enabled(!disabled)
        .activeOffsetX([-6, 6])
        .activeOffsetY([-6, 6])
        .onStart(() => {
          activeGroupId.value = piece.groupId;
          dragX.value = 0;
          dragY.value = 0;
        })
        .onUpdate((event) => {
          if (activeGroupId.value === piece.groupId) {
            dragX.value = event.translationX;
            dragY.value = event.translationY;
          }
        })
        .onEnd(() => {
          if (activeGroupId.value === piece.groupId) {
            runOnJS(onDragEnd)(piece.id, dragX.value, dragY.value);
          }
          dragX.value = 0;
          dragY.value = 0;
          activeGroupId.value = '';
        }),
    [activeGroupId, disabled, dragX, dragY, onDragEnd, piece.groupId, piece.id],
  );

  const animatedStyle = useAnimatedStyle(() => {
    const isActiveGroup = activeGroupId.value === piece.groupId;
    return {
      transform: [
        { translateX: isActiveGroup ? dragX.value : 0 },
        { translateY: isActiveGroup ? dragY.value : 0 },
      ],
      zIndex: isActiveGroup ? 10 : 1,
    };
  });

  const number = tileNumber(piece, cols);

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        style={[
          styles.piece,
          {
            left: x,
            top: y,
            width: pieceSize,
            height: pieceSize,
            borderColor: disabled ? 'transparent' : theme.border,
            borderWidth: disabled ? 0 : StyleSheet.hairlineWidth,
            backgroundColor: disabled ? 'transparent' : theme.card,
            elevation: disabled ? 0 : 2,
          },
          animatedStyle,
        ]}
      >
        <View style={styles.clip}>
          {IS_TEST_MODE ? (
            <View
              style={[
                styles.testTile,
                { backgroundColor: TEST_TILE_COLORS[(number - 1) % TEST_TILE_COLORS.length] },
              ]}
            >
              <Text style={[styles.testNumber, { fontSize: Math.max(14, pieceSize * 0.32) }]}>
                {number}
              </Text>
            </View>
          ) : (
            <Image
              source={{ uri: imageUrl }}
              style={{
                position: 'absolute',
                width: pieceSize * cols,
                height: pieceSize * rows,
                left: -piece.originCol * pieceSize,
                top: -piece.originRow * pieceSize,
              }}
            />
          )}
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  piece: {
    position: 'absolute',
    overflow: 'hidden',
  },
  clip: {
    flex: 1,
    overflow: 'hidden',
  },
  testTile: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  testNumber: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
