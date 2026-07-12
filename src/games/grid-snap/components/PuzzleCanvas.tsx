import { useCallback, useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';

import { DraggablePiece } from './DraggablePiece';
import { gridSizeForDifficulty } from '../core/puzzleEngine';
import { useGridSnapStore } from '../stores/gridSnapStore';
import { useTheme } from '../../../shared/theme/useTheme';

const HINT_HEIGHT = 32;

interface PuzzleCanvasProps {
  compact?: boolean;
}

export function PuzzleCanvas({ compact = false }: PuzzleCanvasProps) {
  const theme = useTheme();
  const activeGroupId = useSharedValue('');
  const dragX = useSharedValue(0);
  const dragY = useSharedValue(0);

  const {
    puzzle,
    imageUrl,
    status,
    pieceSize,
    gridWidth,
    gridHeight,
    difficulty,
    setGridLayout,
    commitDrag,
  } = useGridSnapStore();

  const onBoardLayout = useCallback(
    (width: number, height: number) => {
      if (width <= 0 || height <= 0) {
        return;
      }

      const gridSize = puzzle?.cols ?? gridSizeForDifficulty(difficulty);
      const cellSize = Math.floor(Math.min(width / gridSize, height / gridSize));
      if (cellSize <= 0) {
        return;
      }

      setGridLayout({
        pieceSize: cellSize,
        gridWidth: cellSize * gridSize,
        gridHeight: cellSize * gridSize,
        originX: 0,
        originY: 0,
      });
    },
    [puzzle, difficulty, setGridLayout],
  );

  const gridLines = useMemo(() => {
    if (!puzzle || pieceSize <= 0) {
      return null;
    }

    const verticalLines = Array.from({ length: puzzle.cols + 1 }, (_, index) => (
      <View
        key={`v-${index}`}
        style={[
          styles.gridLine,
          {
            left: index * pieceSize,
            height: gridHeight,
            backgroundColor: theme.border,
          },
        ]}
      />
    ));

    const horizontalLines = Array.from({ length: puzzle.rows + 1 }, (_, index) => (
      <View
        key={`h-${index}`}
        style={[
          styles.gridLineHorizontal,
          {
            top: index * pieceSize,
            width: gridWidth,
            backgroundColor: theme.border,
          },
        ]}
      />
    ));

    return (
      <>
        {verticalLines}
        {horizontalLines}
      </>
    );
  }, [puzzle, pieceSize, gridWidth, gridHeight, theme.border]);

  const isFetching = status === 'loading' || !imageUrl;

  return (
    <View style={styles.container}>
      <View
        style={styles.boardArea}
        onLayout={(event) => {
          const { width, height } = event.nativeEvent.layout;
          onBoardLayout(width, height);
        }}
      >
        {isFetching || !puzzle ? (
          <View style={styles.loading}>
            <ActivityIndicator color={theme.coral} />
            <Text style={{ color: theme.textSecondary }}>Loading puzzle…</Text>
          </View>
        ) : (
          <View
            style={[
              styles.gridBoard,
              {
                width: gridWidth,
                height: gridHeight,
                borderColor: theme.border,
                backgroundColor: theme.tileEmpty,
              },
            ]}
          >
            <View style={styles.gridLines} pointerEvents="none">
              {gridLines}
            </View>

            {puzzle.pieces.map((piece) => (
              <DraggablePiece
                key={piece.id}
                piece={piece}
                imageUrl={imageUrl}
                rows={puzzle.rows}
                cols={puzzle.cols}
                pieceSize={pieceSize}
                activeGroupId={activeGroupId}
                dragX={dragX}
                dragY={dragY}
                onDragEnd={commitDrag}
              />
            ))}
          </View>
        )}
      </View>

      {!compact ? (
        <View style={styles.hintBar}>
          <Text style={[styles.hint, { color: theme.textSecondary }]}>
            Drag a tile to another cell to swap. Matching neighbors snap together.
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  boardArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridBoard: {
    position: 'relative',
    borderWidth: 1,
    overflow: 'hidden',
  },
  gridLines: {
    ...StyleSheet.absoluteFillObject,
  },
  gridLine: {
    position: 'absolute',
    top: 0,
    width: StyleSheet.hairlineWidth,
    opacity: 0.65,
  },
  gridLineHorizontal: {
    position: 'absolute',
    left: 0,
    height: StyleSheet.hairlineWidth,
    opacity: 0.65,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  hintBar: {
    height: HINT_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  hint: {
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 16,
  },
});
