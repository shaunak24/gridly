import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { useTheme } from '../theme/useTheme';

const LETTER_ROWS: { keys: string; inset: number }[] = [
  { keys: 'QWERTYUIOP', inset: 0 },
  { keys: 'ASDFGHJKL', inset: 14 },
  { keys: 'ZXCVBNM', inset: 36 },
];

const KEY_GAP = 6;
const HORIZONTAL_PADDING = 6;
const TOP_ROW_KEY_COUNT = 10;

interface KeyboardProps {
  letterStates: Record<string, 'default' | 'correct' | 'present' | 'absent'>;
  onKey: (key: string) => void;
  onBackspace: () => void;
  onSubmit: () => void;
  disabled?: boolean;
}

function keyColor(
  state: 'default' | 'correct' | 'present' | 'absent',
  theme: ReturnType<typeof useTheme>,
): string {
  switch (state) {
    case 'correct':
      return theme.teal;
    case 'present':
      return theme.amber;
    case 'absent':
      return theme.slate;
    default:
      return theme.keyDefault;
  }
}

export function Keyboard({
  letterStates,
  onKey,
  onBackspace,
  onSubmit,
  disabled = false,
}: KeyboardProps) {
  const theme = useTheme();
  const { width: screenWidth } = useWindowDimensions();

  const keyWidth =
    (screenWidth - HORIZONTAL_PADDING * 2 - KEY_GAP * (TOP_ROW_KEY_COUNT - 1)) /
    TOP_ROW_KEY_COUNT;
  const keyHeight = 58;
  const fontSize = Math.max(17, Math.min(22, keyWidth * 0.52));

  return (
    <View style={styles.container}>
      {LETTER_ROWS.map(({ keys, inset }) => (
        <View
          key={keys}
          style={[styles.row, { paddingHorizontal: HORIZONTAL_PADDING + inset }]}
        >
          {keys.split('').map((letter) => {
            const state = letterStates[letter] ?? 'default';
            return (
              <Pressable
                key={letter}
                disabled={disabled}
                onPress={() => onKey(letter)}
                style={({ pressed }) => [
                  styles.key,
                  {
                    width: keyWidth,
                    height: keyHeight,
                    backgroundColor: keyColor(state, theme),
                  },
                  pressed && !disabled && styles.keyPressed,
                ]}
              >
                <Text style={[styles.keyText, { fontSize, color: theme.keyText }]}>
                  {letter}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ))}
      <View style={[styles.row, { paddingHorizontal: HORIZONTAL_PADDING }]}>
        <Pressable
          disabled={disabled}
          onPress={onSubmit}
          style={({ pressed }) => [
            styles.specialKey,
            { height: keyHeight, backgroundColor: theme.keyDefault },
            pressed && !disabled && styles.keyPressed,
          ]}
        >
          <Text style={[styles.keyText, { fontSize: fontSize - 2, color: theme.keyText }]}>
            ENTER
          </Text>
        </Pressable>
        <Pressable
          disabled={disabled}
          onPress={onBackspace}
          style={({ pressed }) => [
            styles.specialKey,
            { height: keyHeight, backgroundColor: theme.keyDefault },
            pressed && !disabled && styles.keyPressed,
          ]}
        >
          <Text style={[styles.keyText, { fontSize: fontSize + 2, color: theme.keyText }]}>
            ⌫
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 10, paddingBottom: 4 },
  row: { flexDirection: 'row', justifyContent: 'center', gap: KEY_GAP },
  key: { borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  specialKey: {
    flex: 1,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  keyPressed: { opacity: 0.75 },
  keyText: { fontWeight: '700' },
});
