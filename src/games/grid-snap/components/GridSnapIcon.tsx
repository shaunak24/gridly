import { StyleSheet, View } from 'react-native';

import { useTheme } from '../../../shared/theme/useTheme';

/** Mini landscape palette — reads as photo fragments, not game feedback colors. */
const PHOTO = {
  sky: '#4A90D9',
  skyLight: '#7BB8F5',
  grass: '#3D8B5F',
  grassLight: '#5CB87A',
  sand: '#D4A056',
  earth: '#8B6340',
} as const;

interface LoosePiece {
  color: string;
  left: number;
  top: number;
  offsetX?: number;
  offsetY?: number;
}

interface GridSnapIconProps {
  size?: number;
}

export function GridSnapIcon({ size = 56 }: GridSnapIconProps) {
  const theme = useTheme();
  const cell = Math.round(size * 0.21);
  const gap = Math.max(2, Math.round(size * 0.035));
  const radius = Math.max(3, Math.round(size * 0.06));
  const originX = Math.round(size * 0.1);
  const originY = Math.round(size * 0.14);

  const snapped: readonly [string, string, string, string] = [
    PHOTO.sky,
    PHOTO.skyLight,
    PHOTO.grass,
    PHOTO.grassLight,
  ];

  const loosePieces: LoosePiece[] = [
    { color: PHOTO.sand, left: originX + cell * 2 + gap * 2.2, top: originY - gap, offsetY: 2 },
    { color: PHOTO.earth, left: originX + cell * 2 + gap * 2.2, top: originY + cell + gap * 2.1 },
    { color: PHOTO.skyLight, left: originX - gap, top: originY + cell * 2 + gap * 1.8, offsetX: -1 },
  ];

  const snappedWidth = cell * 2;
  const snappedHeight = cell * 2;

  return (
    <View style={[styles.frame, { width: size, height: size }]}>
      <View
        style={[
          styles.snappedGroup,
          {
            left: originX,
            top: originY,
            width: snappedWidth,
            height: snappedHeight,
            borderRadius: radius,
            borderColor: theme.border,
          },
        ]}
      >
        <View style={styles.snappedRow}>
          <View style={[styles.snappedCell, { width: cell, height: cell, backgroundColor: snapped[0] }]} />
          <View style={[styles.snappedCell, { width: cell, height: cell, backgroundColor: snapped[1] }]} />
        </View>
        <View style={styles.snappedRow}>
          <View style={[styles.snappedCell, { width: cell, height: cell, backgroundColor: snapped[2] }]} />
          <View style={[styles.snappedCell, { width: cell, height: cell, backgroundColor: snapped[3] }]} />
        </View>
      </View>

      {loosePieces.map((piece, index) => (
        <View
          key={`loose-${index}`}
          style={[
            styles.loosePiece,
            {
              left: piece.left + (piece.offsetX ?? 0),
              top: piece.top + (piece.offsetY ?? 0),
              width: cell,
              height: cell,
              borderRadius: radius - 1,
              backgroundColor: piece.color,
              borderColor: theme.border,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    position: 'relative',
  },
  snappedGroup: {
    position: 'absolute',
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
  },
  snappedRow: {
    flexDirection: 'row',
  },
  snappedCell: {
    flexShrink: 0,
  },
  loosePiece: {
    position: 'absolute',
    borderWidth: StyleSheet.hairlineWidth,
    elevation: 1,
  },
});
