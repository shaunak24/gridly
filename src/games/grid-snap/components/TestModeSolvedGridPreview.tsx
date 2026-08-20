import { StyleSheet, Text, View } from 'react-native';

import { solvedTileNumber, testTileColorForNumber } from '../core/testMode';

interface TestModeSolvedGridPreviewProps {
  rows: number;
  cols: number;
}

export function TestModeSolvedGridPreview({ rows, cols }: TestModeSolvedGridPreviewProps) {
  return (
    <View style={styles.grid}>
      {Array.from({ length: rows }, (_, row) => (
        <View key={`row-${row}`} style={styles.row}>
          {Array.from({ length: cols }, (_, col) => {
            const number = solvedTileNumber(row, col, cols);
            return (
              <View
                key={`cell-${row}-${col}`}
                style={[styles.cell, { backgroundColor: testTileColorForNumber(number) }]}
              >
                <Text style={styles.number}>{number}</Text>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  number: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
});
