import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../../shared/theme/useTheme';

type TileState = 'correct' | 'present' | 'absent' | 'empty';

interface MiniTile {
  letter: string;
  state: TileState;
}

/** Two rows of a solved-ish puzzle: a mixed guess, then a winning row. */
const ROWS: MiniTile[][] = [
  [
    { letter: 'S', state: 'absent' },
    { letter: 'T', state: 'absent' },
    { letter: 'A', state: 'present' },
    { letter: 'R', state: 'correct' },
    { letter: 'S', state: 'absent' },
  ],
  [
    { letter: 'C', state: 'correct' },
    { letter: 'R', state: 'correct' },
    { letter: 'A', state: 'correct' },
    { letter: 'N', state: 'correct' },
    { letter: 'E', state: 'correct' },
  ],
];

interface WordHuntIconProps {
  size?: number;
}

export function WordHuntIcon({ size = 56 }: WordHuntIconProps) {
  const theme = useTheme();
  const cols = 5;
  const rows = ROWS.length;
  const gap = Math.max(2, Math.round(size * 0.04));
  const cellSize = Math.floor((size - gap * (cols - 1)) / cols);
  const fontSize = Math.max(7, Math.round(cellSize * 0.58));
  const gridWidth = cellSize * cols + gap * (cols - 1);
  const gridHeight = cellSize * rows + gap * (rows - 1);

  const tileColor = (state: TileState): string => {
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
  };

  return (
    <View style={[styles.frame, { width: size, height: size }]}>
      <View style={[styles.grid, { width: gridWidth, height: gridHeight, gap }]}>
        {ROWS.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} style={[styles.row, { gap }]}>
            {row.map((tile, colIndex) => (
              <View
                key={`cell-${rowIndex}-${colIndex}`}
                style={[
                  styles.cell,
                  {
                    width: cellSize,
                    height: cellSize,
                    backgroundColor: tileColor(tile.state),
                  },
                ]}
              >
                <Text
                  style={[
                    styles.letter,
                    {
                      fontSize,
                      color: tile.state === 'empty' ? theme.textSecondary : theme.textPrimary,
                    },
                  ]}
                >
                  {tile.letter}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    gap: 2,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: {
    fontWeight: '800',
    includeFontPadding: false,
    textAlign: 'center',
  },
});
