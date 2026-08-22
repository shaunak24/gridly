import { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type ListRenderItemInfo,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { colorHexForIndex } from '../core/colors';
import { levelSpecForSeason } from '../core/levelCurve';
import {
  COLOR_FLOW_REACHES,
  getSeasonById,
  reachTitleForLevel,
  type SeasonDef,
} from '../core/seasons';
import { useTheme } from '../../../shared/theme/useTheme';

const NODE_SIZE = 52;
const ROW_GAP = 28;
const PATH_WIDTH = 6;
const REACH_LABEL_HEIGHT = 24;
const NODE_ROW_HEIGHT = NODE_SIZE + ROW_GAP;
const PATH_SEGMENT_HEIGHT = NODE_SIZE + ROW_GAP;

const REACH_STARTS = new Set(COLOR_FLOW_REACHES.map((reach) => reach.fromLevel));

type NodeState = 'locked' | 'current' | 'completed';

interface FlowPathMapProps {
  seasonId: string;
  highestUnlocked: number;
  completedLevels: number[];
  onSelectLevel: (level: number) => void;
}

function columnForLevel(level: number): number {
  const pattern = level % 3;
  if (pattern === 1) {
    return 0;
  }
  if (pattern === 2) {
    return 1;
  }
  return 2;
}

function levelItemHeight(level: number, levelCount: number): number {
  let height = NODE_ROW_HEIGHT;
  if (level < levelCount) {
    height += PATH_SEGMENT_HEIGHT;
  }
  if (REACH_STARTS.has(level)) {
    height += REACH_LABEL_HEIGHT;
  }
  return height;
}

function nodeStateForLevel(
  level: number,
  highestUnlocked: number,
  completedSet: Set<number>,
): NodeState {
  if (level > highestUnlocked) {
    return 'locked';
  }
  if (completedSet.has(level)) {
    return 'completed';
  }
  if (level === highestUnlocked) {
    return 'current';
  }
  return 'current';
}

const FlowPathNode = memo(function FlowPathNode({
  level,
  state,
  colorHex,
  onPress,
}: {
  level: number;
  state: NodeState;
  colorHex: string;
  onPress: () => void;
}) {
  const theme = useTheme();
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (state !== 'current') {
      pulse.value = 1;
      return;
    }
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 900, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, [state, pulse]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: state === 'current' ? pulse.value : 1 }],
  }));

  const backgroundColor =
    state === 'completed' ? `${colorHex}66` : state === 'current' ? `${theme.coral}44` : theme.tileEmpty;
  const borderColor = state === 'locked' ? theme.border : state === 'current' ? theme.coral : colorHex;

  return (
    <Pressable
      onPress={onPress}
      disabled={state === 'locked'}
      accessibilityRole="button"
      accessibilityLabel={`Level ${level}`}
      accessibilityState={{ disabled: state === 'locked', selected: state === 'current' }}
    >
      <Animated.View
        style={[
          styles.node,
          animatedStyle,
          {
            backgroundColor,
            borderColor,
            opacity: state === 'locked' ? 0.45 : 1,
          },
        ]}
      >
        {state === 'completed' ? (
          <Text style={[styles.check, { color: colorHex }]}>✓</Text>
        ) : (
          <Text style={[styles.levelNumber, { color: theme.textPrimary }]}>{level}</Text>
        )}
      </Animated.View>
    </Pressable>
  );
});

function PathSegment({
  fromCol,
  toCol,
  color,
}: {
  fromCol: number;
  toCol: number;
  color: string;
}) {
  const horizontalShift = (toCol - fromCol) * (NODE_SIZE + 36);
  const segmentHeight = PATH_SEGMENT_HEIGHT;

  return (
    <View style={[styles.pathSegment, { height: segmentHeight }]}>
      <View
        style={[
          styles.pathVertical,
          {
            backgroundColor: color,
            left: fromCol * (NODE_SIZE + 36) + NODE_SIZE / 2 - PATH_WIDTH / 2,
          },
        ]}
      />
      {fromCol !== toCol ? (
        <View
          style={[
            styles.pathHorizontal,
            {
              backgroundColor: color,
              width: Math.abs(horizontalShift),
              left:
                horizontalShift > 0
                  ? fromCol * (NODE_SIZE + 36) + NODE_SIZE / 2
                  : toCol * (NODE_SIZE + 36) + NODE_SIZE / 2,
              top: segmentHeight / 2 - PATH_WIDTH / 2,
            },
          ]}
        />
      ) : null}
      <View
        style={[
          styles.pathVerticalShort,
          {
            backgroundColor: color,
            left: toCol * (NODE_SIZE + 36) + NODE_SIZE / 2 - PATH_WIDTH / 2,
            top: segmentHeight / 2,
          },
        ]}
      />
    </View>
  );
}

const LevelMapItem = memo(function LevelMapItem({
  level,
  levelCount,
  seasonId,
  highestUnlocked,
  completedSet,
  trackWidth,
  onSelectLevel,
}: {
  level: number;
  levelCount: number;
  seasonId: string;
  highestUnlocked: number;
  completedSet: Set<number>;
  trackWidth: number;
  onSelectLevel: (level: number) => void;
}) {
  const theme = useTheme();
  const nextLevel = level + 1;
  const state = nodeStateForLevel(level, highestUnlocked, completedSet);
  const spec = levelSpecForSeason(seasonId, level);
  const nodeColor = colorHexForIndex(spec.pairCount % 6);
  const fromCol = columnForLevel(level);
  const toCol = columnForLevel(nextLevel);
  const pathColor = completedSet.has(level) || level < highestUnlocked ? nodeColor : theme.border;
  const showReach = REACH_STARTS.has(level);

  return (
    <View style={{ width: trackWidth }}>
      {showReach ? (
        <View style={styles.reachInline}>
          <Text style={[styles.reachInlineText, { color: theme.coral }]}>
            {reachTitleForLevel(level)}
          </Text>
        </View>
      ) : null}
      <View style={[styles.nodeRow, { height: NODE_ROW_HEIGHT }]}>
        <View style={{ marginLeft: fromCol * (NODE_SIZE + 36) }}>
          <FlowPathNode
            level={level}
            state={state}
            colorHex={nodeColor}
            onPress={() => onSelectLevel(level)}
          />
        </View>
      </View>
      {level < levelCount ? <PathSegment fromCol={fromCol} toCol={toCol} color={pathColor} /> : null}
    </View>
  );
});

export function FlowPathMap({
  seasonId,
  highestUnlocked,
  completedLevels,
  onSelectLevel,
}: FlowPathMapProps) {
  const listRef = useRef<FlatList<number>>(null);
  const { width } = useWindowDimensions();
  const season = getSeasonById(seasonId);
  const levelCount = season?.levelCount ?? 100;

  const completedSet = useMemo(() => new Set(completedLevels), [completedLevels]);
  const trackWidth = NODE_SIZE * 3 + 72;
  const levels = useMemo(
    () => Array.from({ length: levelCount }, (_, index) => index + 1),
    [levelCount],
  );

  const itemLayouts = useMemo(() => {
    const offsets: number[] = [];
    const lengths: number[] = [];
    let offset = 0;
    for (let level = 1; level <= levelCount; level += 1) {
      offsets.push(offset);
      const height = levelItemHeight(level, levelCount);
      lengths.push(height);
      offset += height;
    }
    return { offsets, lengths };
  }, [levelCount]);

  useEffect(() => {
    const currentLevel = Math.min(highestUnlocked, levelCount);
    const index = currentLevel - 1;
    if (index < 0) {
      return;
    }

    requestAnimationFrame(() => {
      listRef.current?.scrollToIndex({
        index,
        animated: false,
        viewPosition: 0.25,
      });
    });
  }, [highestUnlocked, levelCount]);

  const renderItem = useCallback(
    ({ item: level }: ListRenderItemInfo<number>) => (
      <LevelMapItem
        level={level}
        levelCount={levelCount}
        seasonId={seasonId}
        highestUnlocked={highestUnlocked}
        completedSet={completedSet}
        trackWidth={trackWidth}
        onSelectLevel={onSelectLevel}
      />
    ),
    [levelCount, seasonId, highestUnlocked, completedSet, trackWidth, onSelectLevel],
  );

  const getItemLayout = useCallback(
    (_: ArrayLike<number> | null | undefined, index: number) => ({
      length: itemLayouts.lengths[index] ?? levelItemHeight(index + 1, levelCount),
      offset: itemLayouts.offsets[index] ?? 0,
      index,
    }),
    [itemLayouts, levelCount],
  );

  if (!season) {
    return null;
  }

  const horizontalPadding = Math.max(16, (width - trackWidth) / 2);

  return (
    <FlatList
      ref={listRef}
      data={levels}
      keyExtractor={(level) => String(level)}
      renderItem={renderItem}
      getItemLayout={getItemLayout}
      initialNumToRender={14}
      maxToRenderPerBatch={20}
      windowSize={9}
      removeClippedSubviews
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingHorizontal: horizontalPadding },
      ]}
      ListHeaderComponent={
        <SeasonHeader
          season={season}
          completedCount={completedLevels.length}
          levelCount={levelCount}
        />
      }
      onScrollToIndexFailed={(info) => {
        const offset = itemLayouts.offsets[info.index] ?? 0;
        listRef.current?.scrollToOffset({ offset, animated: false });
      }}
    />
  );
}

function SeasonHeader({
  season,
  completedCount,
  levelCount,
}: {
  season: SeasonDef;
  completedCount: number;
  levelCount: number;
}) {
  const theme = useTheme();
  const progress = levelCount > 0 ? completedCount / levelCount : 0;

  return (
    <View style={styles.headerBlock}>
      <Text style={[styles.seasonTitle, { color: theme.textPrimary }]}>{season.title}</Text>
      <Text style={[styles.seasonProgress, { color: theme.textSecondary }]}>
        {completedCount} / {levelCount} levels complete
      </Text>
      <View style={[styles.progressTrack, { backgroundColor: theme.tileEmpty }]}>
        <View
          style={[
            styles.progressFill,
            { backgroundColor: theme.coral, width: `${Math.round(progress * 100)}%` },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 120,
  },
  headerBlock: {
    marginBottom: 20,
    gap: 6,
  },
  seasonTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  seasonProgress: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  reachInline: {
    height: REACH_LABEL_HEIGHT,
    justifyContent: 'center',
  },
  reachInlineText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  nodeRow: {
    alignItems: 'flex-start',
  },
  node: {
    width: NODE_SIZE,
    height: NODE_SIZE,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelNumber: {
    fontSize: 16,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  check: {
    fontSize: 20,
    fontWeight: '800',
  },
  pathSegment: {
    position: 'relative',
    width: '100%',
  },
  pathVertical: {
    position: 'absolute',
    top: 0,
    width: PATH_WIDTH,
    height: '50%',
    borderRadius: PATH_WIDTH,
    opacity: 0.85,
  },
  pathHorizontal: {
    position: 'absolute',
    height: PATH_WIDTH,
    borderRadius: PATH_WIDTH,
    opacity: 0.85,
  },
  pathVerticalShort: {
    position: 'absolute',
    width: PATH_WIDTH,
    height: '50%',
    borderRadius: PATH_WIDTH,
    opacity: 0.85,
  },
});
