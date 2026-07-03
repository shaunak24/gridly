import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../theme/useTheme';

const ROWS = 6;
const COLS = 5;

const GRID_HINTS: (keyof ReturnType<typeof useTheme> | null)[][] = [
  [null, null, 'teal', null, null],
  [null, 'amber', null, null, null],
  [null, null, 'coral', null, null],
  [null, null, null, null, null],
  [null, null, null, null, null],
  [null, null, null, null, null],
];

interface GridLogoProps {
  size?: number;
}

export function GridLogo({ size = 120 }: GridLogoProps) {
  const theme = useTheme();
  const cellSize = size / COLS - 4;

  return (
    <View style={[styles.container, { width: size, height: (size / COLS) * ROWS }]}>
      {GRID_HINTS.map((row, rowIndex) => (
        <View key={`row-${rowIndex}`} style={styles.row}>
          {row.map((cellColor, colIndex) => (
            <View
              key={`cell-${rowIndex}-${colIndex}`}
              style={[
                styles.cell,
                {
                  width: cellSize,
                  height: cellSize,
                  backgroundColor: cellColor ? theme[cellColor] : theme.tileEmpty,
                },
              ]}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 4 },
  row: { flexDirection: 'row', gap: 4 },
  cell: { borderRadius: 4 },
});
