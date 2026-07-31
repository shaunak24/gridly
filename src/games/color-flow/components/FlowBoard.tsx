import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

import {
  buildPathColorMap,
  filledCellCount,
  isInsideBoard,
  isPairConnected,
  pointKey,
  pointsEqual,
  resolveTouchCell,
} from '../core/flowEngine';
import type { FlowBoard, FlowGameState, Point } from '../core/types';
import { useTheme } from '../../../shared/theme/useTheme';
import { impactLight, selection } from '../../../shared/utils/haptics';

interface FlowBoardProps {
  board: FlowBoard;
  gameState: FlowGameState;
  activeColorId: string | null;
  isPlaying: boolean;
  onBeginDrag: (point: Point) => string | null;
  onExtendDrag: (colorId: string, from: Point | null, to: Point) => void;
  onCommitDrag: () => void;
}

/** Alpha suffix for the faint fill behind a drawn cell. */
const CELL_TINT_ALPHA = '22';

function cellCenter(cellSize: number, point: Point): { x: number; y: number } {
  return {
    x: point.c * cellSize + cellSize / 2,
    y: point.r * cellSize + cellSize / 2,
  };
}

function FlowBoardViewComponent({
  board,
  gameState,
  activeColorId,
  isPlaying,
  onBeginDrag,
  onExtendDrag,
  onCommitDrag,
}: FlowBoardProps) {
  const theme = useTheme();
  const [layoutSize, setLayoutSize] = useState(0);

  const gestureColorRef = useRef<string | null>(null);
  const lastCellRef = useRef<Point | null>(null);
  const inertRef = useRef(true);

  const cellSize = layoutSize > 0 ? layoutSize / board.cols : 0;
  const pipeThickness = Math.max(10, cellSize * 0.34);

  const connectedIds = useMemo(() => {
    const ids = new Set<string>();
    for (const pair of board.pairs) {
      if (isPairConnected(pair, gameState.paths[pair.id] ?? [])) {
        ids.add(pair.id);
      }
    }
    return ids;
  }, [board.pairs, gameState.paths]);

  const filledCells = filledCellCount(gameState.paths);
  const totalCells = board.rows * board.cols;
  const totalPairs = board.pairs.length;

  // Buzz once when a pair snaps together, not on every cell entered.
  const previousConnectedRef = useRef(connectedIds.size);
  useEffect(() => {
    if (connectedIds.size > previousConnectedRef.current) {
      impactLight();
    }
    previousConnectedRef.current = connectedIds.size;
  }, [connectedIds.size]);

  const handleBegin = useCallback(
    (x: number, y: number) => {
      inertRef.current = true;
      gestureColorRef.current = null;
      lastCellRef.current = null;

      if (!isPlaying || !isInsideBoard(x, y, cellSize, board.rows, board.cols)) {
        return;
      }

      const cell = resolveTouchCell({
        x,
        y,
        cellSize,
        rows: board.rows,
        cols: board.cols,
        current: null,
      });
      const colorId = onBeginDrag(cell);
      if (!colorId) {
        return;
      }

      inertRef.current = false;
      gestureColorRef.current = colorId;
      lastCellRef.current = cell;
      selection();
    },
    [board.cols, board.rows, cellSize, isPlaying, onBeginDrag],
  );

  const handleUpdate = useCallback(
    (x: number, y: number) => {
      const colorId = gestureColorRef.current;
      if (inertRef.current || !colorId || !isPlaying) {
        return;
      }

      const from = lastCellRef.current;
      const cell = resolveTouchCell({
        x,
        y,
        cellSize,
        rows: board.rows,
        cols: board.cols,
        current: from,
      });
      if (from && pointsEqual(from, cell)) {
        return;
      }

      onExtendDrag(colorId, from, cell);
      lastCellRef.current = cell;
    },
    [board.cols, board.rows, cellSize, isPlaying, onExtendDrag],
  );

  const handleFinalize = useCallback(() => {
    const wasDrawing = !inertRef.current;
    inertRef.current = true;
    gestureColorRef.current = null;
    lastCellRef.current = null;
    if (wasDrawing) {
      onCommitDrag();
    }
  }, [onCommitDrag]);

  const drawGesture = useMemo(
    () =>
      Gesture.Pan()
        .enabled(isPlaying)
        .minDistance(0)
        .maxPointers(1)
        .onBegin((event) => {
          runOnJS(handleBegin)(event.x, event.y);
        })
        .onUpdate((event) => {
          runOnJS(handleUpdate)(event.x, event.y);
        })
        .onFinalize(() => {
          runOnJS(handleFinalize)();
        }),
    [handleBegin, handleFinalize, handleUpdate, isPlaying],
  );

  // Measure the grid itself, not the bordered frame, so gesture and cell coordinates share an origin.
  const onLayout = useCallback((event: LayoutChangeEvent) => {
    setLayoutSize(event.nativeEvent.layout.width);
  }, []);

  const rows = useMemo(
    () =>
      Array.from({ length: board.rows }, (_, row) =>
        Array.from({ length: board.cols }, (_, col) => ({ r: row, c: col })),
      ),
    [board.cols, board.rows],
  );

  const cellColors = useMemo(
    () => buildPathColorMap(board, gameState.paths),
    [board, gameState.paths],
  );

  const pathSegments = useMemo(() => {
    if (cellSize <= 0) {
      return [];
    }

    const segments: {
      colorHex: string;
      x1: number;
      y1: number;
      x2: number;
      y2: number;
    }[] = [];

    for (const pair of board.pairs) {
      const path = gameState.paths[pair.id] ?? [];
      for (let index = 1; index < path.length; index += 1) {
        const start = cellCenter(cellSize, path[index - 1]);
        const end = cellCenter(cellSize, path[index]);
        segments.push({
          colorHex: pair.colorHex,
          x1: start.x,
          y1: start.y,
          x2: end.x,
          y2: end.y,
        });
      }
    }

    return segments;
  }, [board.pairs, cellSize, gameState.paths]);

  const pathJoints = useMemo(() => {
    if (cellSize <= 0) {
      return [];
    }
    return Array.from(cellColors.entries()).map(([key, colorHex]) => {
      const [r, c] = key.split(',').map(Number);
      const center = cellCenter(cellSize, { r, c });
      return { ...center, colorHex };
    });
  }, [cellColors, cellSize]);

  return (
    <View style={styles.wrapper}>
      <View style={[styles.statusPill, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.statusText, { color: theme.textPrimary }]}>
          Flows: {connectedIds.size}/{totalPairs} · Cells: {filledCells}/{totalCells}
        </Text>
      </View>

      {isPlaying ? (
        <Text style={[styles.hint, { color: activeColorId ? theme.coral : theme.textSecondary }]}>
          {activeColorId
            ? 'Keep dragging to the matching dot · drag back to erase'
            : 'Drag from a colored dot to its match and fill every cell'}
        </Text>
      ) : null}

      <View
        style={[styles.boardFrame, { borderColor: theme.border, backgroundColor: theme.card }]}
      >
        <GestureDetector gesture={drawGesture}>
          <View style={styles.grid} onLayout={onLayout}>
            {cellSize > 0 ? (
              <>
                {rows.map((row, rowIndex) => (
                  <View key={`row-${rowIndex}`} style={styles.row}>
                    {row.map(({ r, c }) => {
                      const colorHex = cellColors.get(pointKey({ r, c }));
                      const isLastCol = c === board.cols - 1;
                      const isLastRow = r === board.rows - 1;

                      return (
                        <View
                          key={`cell-${r}-${c}`}
                          pointerEvents="none"
                          style={[
                            styles.cell,
                            {
                              width: cellSize,
                              height: cellSize,
                              borderRightColor: isLastCol ? 'transparent' : theme.border,
                              borderBottomColor: isLastRow ? 'transparent' : theme.border,
                              backgroundColor: colorHex
                                ? `${colorHex}${CELL_TINT_ALPHA}`
                                : theme.tileEmpty,
                            },
                          ]}
                        />
                      );
                    })}
                  </View>
                ))}

                <View style={StyleSheet.absoluteFill} pointerEvents="none">
                  {pathSegments.map((segment, index) => {
                    const horizontal = segment.y1 === segment.y2;
                    const length = horizontal
                      ? Math.abs(segment.x2 - segment.x1)
                      : Math.abs(segment.y2 - segment.y1);
                    const left = horizontal
                      ? Math.min(segment.x1, segment.x2)
                      : segment.x1 - pipeThickness / 2;
                    const top = horizontal
                      ? segment.y1 - pipeThickness / 2
                      : Math.min(segment.y1, segment.y2);

                    return (
                      <View
                        key={`segment-${index}`}
                        style={{
                          position: 'absolute',
                          left,
                          top,
                          width: horizontal ? length : pipeThickness,
                          height: horizontal ? pipeThickness : length,
                          backgroundColor: segment.colorHex,
                          borderRadius: pipeThickness / 2,
                        }}
                      />
                    );
                  })}

                  {pathJoints.map((joint, index) => (
                    <View
                      key={`joint-${index}`}
                      style={{
                        position: 'absolute',
                        left: joint.x - pipeThickness / 2,
                        top: joint.y - pipeThickness / 2,
                        width: pipeThickness,
                        height: pipeThickness,
                        borderRadius: pipeThickness / 2,
                        backgroundColor: joint.colorHex,
                      }}
                    />
                  ))}

                  {board.pairs.map((pair) => {
                    const isSelected = activeColorId === pair.id;
                    const isConnected = connectedIds.has(pair.id);
                    const dotSize = cellSize * (isConnected ? 0.5 : 0.42);
                    const endpoints = [pair.p1, pair.p2];

                    return endpoints.map((point, index) => {
                      const center = cellCenter(cellSize, point);
                      return (
                        <View
                          key={`${pair.id}-endpoint-${index}`}
                          style={{
                            position: 'absolute',
                            left: center.x - dotSize / 2,
                            top: center.y - dotSize / 2,
                            width: dotSize,
                            height: dotSize,
                            borderRadius: dotSize / 2,
                            backgroundColor: pair.colorHex,
                            borderWidth: isSelected || isConnected ? 3 : 2,
                            borderColor: isSelected ? theme.textPrimary : theme.background,
                            // Centre the "done" pip with layout, not offsets: the border
                            // insets the content box and its width varies by state.
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {isConnected ? (
                            <View
                              style={{
                                width: dotSize * 0.34,
                                height: dotSize * 0.34,
                                borderRadius: dotSize * 0.17,
                                backgroundColor: theme.background,
                              }}
                            />
                          ) : null}
                        </View>
                      );
                    });
                  })}
                </View>
              </>
            ) : null}
          </View>
        </GestureDetector>
      </View>
    </View>
  );
}

export const FlowBoardView = memo(FlowBoardViewComponent);

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    gap: 8,
    alignItems: 'center',
    minHeight: 0,
  },
  statusPill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  hint: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 8,
  },
  boardFrame: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  grid: {
    flex: 1,
    position: 'relative',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    borderRightWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
