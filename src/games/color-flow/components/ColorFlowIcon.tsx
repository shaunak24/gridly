import { StyleSheet, View } from 'react-native';

import { useTheme } from '../../../shared/theme/useTheme';

const CORAL = '#F97316';
const TEAL = '#14B8A6';

/** 3×3 mini board: coral path top-left → bottom-right, teal path top-right → bottom-left. */
const CELL_COLORS = [
  CORAL,
  CORAL,
  TEAL,
  CORAL,
  CORAL,
  TEAL,
  TEAL,
  TEAL,
  CORAL,
] as const;

interface ColorFlowIconProps {
  size?: number;
}

export function ColorFlowIcon({ size = 56 }: ColorFlowIconProps) {
  const theme = useTheme();
  const gridCells = 3;
  const gap = Math.max(2, Math.round(size * 0.05));
  const cellSize = Math.floor((size - gap * (gridCells - 1)) / gridCells);
  const gridWidth = cellSize * gridCells + gap * (gridCells - 1);
  const gridHeight = gridWidth;
  const dotSize = Math.max(4, Math.round(cellSize * 0.38));
  const endpointIndices = new Set([0, 2, 6, 8]);

  return (
    <View style={[styles.frame, { width: size, height: size }]}>
      <View style={[styles.grid, { width: gridWidth, height: gridHeight, gap }]}>
        {CELL_COLORS.map((color, index) => {
          const row = Math.floor(index / gridCells);
          const col = index % gridCells;
          const isEndpoint = endpointIndices.has(index);

          return (
            <View
              key={`cell-${index}`}
              style={[
                styles.cell,
                {
                  width: cellSize,
                  height: cellSize,
                  backgroundColor: isEndpoint ? theme.tileEmpty : `${color}55`,
                },
              ]}
            >
              {isEndpoint ? (
                <View
                  style={[
                    styles.dot,
                    {
                      width: dotSize,
                      height: dotSize,
                      backgroundColor: color,
                    },
                  ]}
                />
              ) : (
                <View
                  style={[
                    styles.pipe,
                    {
                      backgroundColor: color,
                      width: col === 1 ? '70%' : '55%',
                      height: row === 1 ? '70%' : '55%',
                    },
                  ]}
                />
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    borderRadius: 999,
  },
  pipe: {
    borderRadius: 999,
  },
});
