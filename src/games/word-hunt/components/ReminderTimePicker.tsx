import { useCallback, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { formatReminderTime } from '../../../shared/utils/formatTime';
import { useTheme } from '../../../shared/theme/useTheme';

interface ReminderTimePickerProps {
  hour: number;
  minute: number;
  enabled: boolean;
  onChange: (hour: number, minute: number) => void;
}

function clampHour(value: number): number {
  return ((value % 24) + 24) % 24;
}

function clampMinute(value: number): number {
  return ((value % 60) + 60) % 60;
}

function formatHourOnly(hour: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour} ${period}`;
}

export function ReminderTimePicker({ hour, minute, enabled, onChange }: ReminderTimePickerProps) {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);
  const [draftHour, setDraftHour] = useState(hour);
  const [draftMinute, setDraftMinute] = useState(minute);

  const label = useMemo(() => formatReminderTime(hour, minute), [hour, minute]);

  const openPicker = useCallback(() => {
    if (!enabled) {
      return;
    }
    setDraftHour(hour);
    setDraftMinute(minute);
    setVisible(true);
  }, [enabled, hour, minute]);

  const apply = useCallback(() => {
    onChange(draftHour, draftMinute);
    setVisible(false);
  }, [draftHour, draftMinute, onChange]);

  const adjustHour = useCallback((delta: number) => {
    setDraftHour((current) => clampHour(current + delta));
  }, []);

  const adjustMinute = useCallback((delta: number) => {
    setDraftMinute((current) => clampMinute(current + delta));
  }, []);

  return (
    <>
      <Pressable
        style={styles.row}
        onPress={openPicker}
        disabled={!enabled}
        accessibilityRole="button"
        accessibilityLabel={`Reminder time ${label}`}
      >
        <Text style={[styles.label, { color: theme.textPrimary }]}>Reminder time</Text>
        <Text style={[styles.value, { color: enabled ? theme.coral : theme.textSecondary }]}>
          {label}
        </Text>
      </Pressable>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <View style={styles.overlay}>
          <View style={[styles.sheet, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.title, { color: theme.textPrimary }]}>Reminder time</Text>

            <View style={styles.stepperRow}>
              <Text style={[styles.stepperLabel, { color: theme.textSecondary }]}>Hour</Text>
              <View style={styles.stepper}>
                <Pressable onPress={() => adjustHour(-1)} style={styles.stepButton}>
                  <Text style={[styles.stepText, { color: theme.textPrimary }]}>−</Text>
                </Pressable>
                <Text style={[styles.stepValue, { color: theme.textPrimary }]}>
                  {formatHourOnly(draftHour)}
                </Text>
                <Pressable onPress={() => adjustHour(1)} style={styles.stepButton}>
                  <Text style={[styles.stepText, { color: theme.textPrimary }]}>+</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.stepperRow}>
              <Text style={[styles.stepperLabel, { color: theme.textSecondary }]}>Minute</Text>
              <View style={styles.stepper}>
                <Pressable onPress={() => adjustMinute(-5)} style={styles.stepButton}>
                  <Text style={[styles.stepText, { color: theme.textPrimary }]}>−</Text>
                </Pressable>
                <Text style={[styles.stepValue, { color: theme.textPrimary }]}>
                  {String(draftMinute).padStart(2, '0')}
                </Text>
                <Pressable onPress={() => adjustMinute(5)} style={styles.stepButton}>
                  <Text style={[styles.stepText, { color: theme.textPrimary }]}>+</Text>
                </Pressable>
              </View>
            </View>

            <Text style={[styles.preview, { color: theme.textSecondary }]}>
              {formatReminderTime(draftHour, draftMinute)}
            </Text>

            <View style={styles.actions}>
              <Pressable onPress={() => setVisible(false)} style={styles.actionButton}>
                <Text style={[styles.actionSecondary, { color: theme.textSecondary }]}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={apply}
                style={[styles.actionButton, styles.doneButton, { backgroundColor: theme.coral }]}
              >
                <Text style={[styles.actionPrimary, { color: theme.textPrimary }]}>Done</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 36,
  },
  label: { fontSize: 15, fontWeight: '600' },
  value: { fontSize: 15, fontWeight: '600' },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  sheet: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 20,
    gap: 16,
  },
  title: { fontSize: 18, fontWeight: '700', textAlign: 'center' },
  stepperRow: { gap: 8 },
  stepperLabel: { fontSize: 13, fontWeight: '600' },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: { fontSize: 28, fontWeight: '500' },
  stepValue: { fontSize: 22, fontWeight: '700', minWidth: 88, textAlign: 'center' },
  preview: { fontSize: 14, textAlign: 'center' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  actionButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneButton: {},
  actionSecondary: { fontSize: 16, fontWeight: '600' },
  actionPrimary: { fontSize: 16, fontWeight: '700' },
});
