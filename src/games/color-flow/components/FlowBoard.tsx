import { useCallback, useMemo, useRef, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

import {
  connectedPairCount,
  getEndpointColor,
  pointKey,
  pointsEqual,
} from '../core/flowEngine';
import type { FlowBoard, FlowGameState, Point } from '../core/types';
import { useTheme } from '../../../shared/theme/useTheme';

interface FlowBoardProps {
  board: FlowBoard;
  gameState: FlowGameState;
  activeColorId: string | null;
  isPlaying: boolean;
  onSelectColor: (colorId: string) => void;
  onApplyPoint: (colorId: string, point: Point) => void;
}

function pathColorAt(
  board: FlowBoard,
  paths: FlowGameState['paths'],
  point: Point,
): string | null {
  for (const pair of board.pairs) {
    const path = paths[pair.id] ?? [];
    if (path.some((cell) => pointsEqual(cell, point))) {
      return pair.colorHex;
    }
  }
  return null;
}

function cellCenter(cellSize: number, point: Point): { x: number; y: number } {
  return {
    x: point.c * cellSize + cellSize / 2,
    y: point.r * cellSize + cellSize / 2,
  };
}

export function FlowBoardView({
  board,
  gameState,
  activeColorId,
  isPlaying,
  onSelectColor,
  onApplyPoint,
}: FlowBoardProps) {
  const theme = useTheme();
  const [layoutSize, setLayoutSize] = useState(0);
  const activeColorRef = useRef(activeColorId);
  activeColorRef.current = activeColorId;

  const cellSize = layoutSize > 0 ? layoutSize / board.cols : 0;
  const pipeThickness = Math.max(10, cellSize * 0.34);
  const flowsConnected = connectedPairCount(board, gameState.paths);
  const totalPairs = board.pairs.length;

  const pointFromTouch = useCallback(
    (locationX: number, locationY: number): Point | null => {
      if (cellSize <= 0) {
        return null;
      }
      const c = Math.floor(locationX / cellSize);
      const r = Math.floor(locationY / cellSize);
      if (r < 0 || r >= board.rows || c < 0 || c >= board.cols) {
        return null;
      }
      return { r, c };
    },
    [board.cols, board.rows, cellSize],
  );

  const handleTouch = useCallback(
    (locationX: number, locationY: number) => {
      if (!isPlaying) {
        return;
      }

      const point = pointFromTouch(locationX, locationY);
      if (!point) {
        return;
      }

      const endpointColor = getEndpointColor(board, point);
      const colorId = endpointColor ?? activeColorRef.current;
      if (!colorId) {
        return;
      }

      if (endpointColor) {
        onSelectColor(endpointColor);
      }

      onApplyPoint(colorId, point);
    },
    [board, isPlaying, onApplyPoint, onSelectColor, pointFromTouch],
  );

  const drawGesture = useMemo(
    () =>
      Gesture.Pan()
        .enabled(isPlaying)
        .minDistance(0)
        .onBegin((event) => {
          runOnJS(handleTouch)(event.x, event.y);
        })
        .onUpdate((event) => {
          runOnJS(handleTouch)(event.x, event.y);
        }),
    [handleTouch, isPlaying],
  );

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

    const joints = new Map<string, string>();
    for (const pair of board.pairs) {
      for (const point of gameState.paths[pair.id] ?? []) {
        joints.set(pointKey(point), pair.colorHex);
      }
    }
    return Array.from(joints.entries()).map(([key, colorHex]) => {
      const [r, c] = key.split(',').map(Number);
      const center = cellCenter(cellSize, { r, c });
      return { ...center, colorHex };
    });
  }, [cellSize, board.pairs, gameState.paths]);

  return (
    <View style={styles.wrapper}>
      <View style={[styles.statusPill, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.statusText, { color: theme.textPrimary }]}>
          Flows: {flowsConnected}/{totalPairs} · Coverage: {gameState.coveragePercent}%
        </Text>
      </View>

      {isPlaying ? (
        <>
          <Text style={[styles.hint, { color: theme.textSecondary }]}>
            Drag from a colored dot to its matching dot. Fill every cell.
          </Text>
          <Text style={[styles.activeHint, { color: activeColorId ? theme.coral : theme.textSecondary }]}>
            {activeColorId
              ? 'Keep dragging to the other dot of the same color'
              : 'Start on any colored dot'}
          </Text>
        </>
      ) : null}

      <GestureDetector gesture={drawGesture}>
        <View
          style={[styles.boardFrame, { borderColor: theme.border, backgroundColor: theme.card }]}
          onLayout={onLayout}
        >
          {cellSize > 0 ? (
            <View style={[styles.grid, { width: layoutSize, height: layoutSize }]}>
              {rows.map((row, rowIndex) => (
                <View key={`row-${rowIndex}`} style={styles.row}>
                  {row.map(({ r, c }) => {
                    const point = { r, c };
                    const onPath = Boolean(pathColorAt(board, gameState.paths, point));
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
                            backgroundColor: onPath ? `${theme.tileEmpty}` : theme.tileEmpty,
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
                  const dotSize = cellSize * 0.42;
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
                          borderWidth: isSelected ? 3 : 2,
                          borderColor: isSelected ? theme.textPrimary : theme.background,
                        }}
                      />
                    );
                  });
                })}
              </View>
            </View>
          ) : null}
        </View>
      </GestureDetector>
    </View>
  );
}

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
  activeHint: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  boardFrame: {
    width: '100%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  grid: {
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
