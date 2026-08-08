import { useCallback, useEffect, useMemo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';

import { DraggablePiece } from './DraggablePiece';
import { gridSizeForDifficulty } from '../core/puzzleEngine';
import { useGridSnapStore } from '../stores/gridSnapStore';
import { LoadingIndicator } from '../../../shared/components/LoadingIndicator';
import { useImageReady } from '../../../shared/hooks/useImageReady';
import { useTheme } from '../../../shared/theme/useTheme';

const HINT_HEIGHT = 32;

export function PuzzleCanvas() {
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
    setImageDecodeReady,
  } = useGridSnapStore();

  const { ready: imageReady, onLoad, onError, skipPreload } = useImageReady(imageUrl);

  useEffect(() => {
    setImageDecodeReady(imageReady);
  }, [imageReady, setImageDecodeReady]);

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
  const isComplete = status === 'won';
  const interactionDisabled = status === 'won' || status === 'lost';
  const showBoard = !isFetching && puzzle && imageReady;

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
          <LoadingIndicator label="Loading puzzle…" />
        ) : !imageReady ? (
          <>
            <LoadingIndicator label="Loading image…" />
            {!skipPreload && imageUrl ? (
              <Image
                source={{ uri: imageUrl }}
                style={styles.preload}
                onLoad={onLoad}
                onError={onError}
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
              />
            ) : null}
          </>
        ) : null}

        {showBoard ? (
          <View
            style={[
              styles.gridBoard,
              {
                width: gridWidth,
                height: gridHeight,
                borderColor: isComplete ? 'transparent' : theme.border,
                borderWidth: isComplete ? 0 : 1,
                backgroundColor: isComplete ? 'transparent' : theme.tileEmpty,
              },
            ]}
          >
            {!isComplete ? (
              <View style={styles.gridLines} pointerEvents="none">
                {gridLines}
              </View>
            ) : null}

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
                disabled={interactionDisabled}
              />
            ))}
          </View>
        ) : null}
      </View>

      <View style={styles.hintBar}>
        <Text style={[styles.hint, { color: theme.textSecondary }]}>
          {isComplete
            ? ''
            : 'Drag a tile to another cell to swap. Matching neighbors snap together.'}
        </Text>
      </View>
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
  preload: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  gridBoard: {
    position: 'relative',
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
