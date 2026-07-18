import { useCallback, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import type { SnapDifficulty } from '../core/types';
import { useTheme } from '../../../shared/theme/useTheme';

const DIFFICULTIES: SnapDifficulty[] = ['easy', 'medium', 'hard'];

const DIFFICULTY_LABELS: Record<SnapDifficulty, string> = {
  easy: 'Easy (4×4)',
  medium: 'Medium (6×6)',
  hard: 'Hard (8×8)',
};

interface DifficultyPickerProps {
  difficulty: SnapDifficulty;
  onChange: (difficulty: SnapDifficulty) => void;
  hint?: string;
}

export function DifficultyPicker({
  difficulty,
  onChange,
  hint = 'Used when starting a new puzzle',
}: DifficultyPickerProps) {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);

  const selectDifficulty = useCallback(
    (value: SnapDifficulty) => {
      void onChange(value);
      setVisible(false);
    },
    [onChange],
  );

  return (
    <>
      <Pressable
        style={styles.row}
        onPress={() => setVisible(true)}
        accessibilityRole="button"
        accessibilityLabel={`Default difficulty, ${DIFFICULTY_LABELS[difficulty]}`}
      >
        <View style={styles.copy}>
          <Text style={[styles.label, { color: theme.textPrimary }]}>Default difficulty</Text>
          <Text style={[styles.hint, { color: theme.textSecondary }]}>{hint}</Text>
        </View>
        <Text style={[styles.value, { color: theme.coral }]}>{DIFFICULTY_LABELS[difficulty]}</Text>
      </Pressable>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          <Pressable
            style={[styles.sheet, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={(event) => event.stopPropagation()}
          >
            <Text style={[styles.title, { color: theme.textPrimary }]}>Default difficulty</Text>

            {DIFFICULTIES.map((option) => {
              const selected = option === difficulty;
              return (
                <Pressable
                  key={option}
                  style={({ pressed }) => [
                    styles.option,
                    {
                      backgroundColor: selected ? theme.tileEmpty : 'transparent',
                      borderColor: theme.border,
                    },
                    pressed && styles.pressed,
                  ]}
                  onPress={() => selectDifficulty(option)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                >
                  <Text style={[styles.optionLabel, { color: theme.textPrimary }]}>
                    {DIFFICULTY_LABELS[option]}
                  </Text>
                  {selected ? (
                    <Text style={[styles.checkmark, { color: theme.coral }]}>✓</Text>
                  ) : null}
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  copy: { flex: 1 },
  label: { fontSize: 15, fontWeight: '600' },
  hint: { fontSize: 12, marginTop: 2 },
  value: { fontSize: 14, fontWeight: '700' },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  sheet: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 18,
    fontWeight: '800',
  },
  pressed: { opacity: 0.85 },
});
