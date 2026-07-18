import { useRouter } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DifficultyPicker } from '../../../src/games/grid-snap/components/DifficultyPicker';
import { useGridSnapSettingsStore } from '../../../src/games/grid-snap/stores/gridSnapSettingsStore';
import { useGridSnapStore } from '../../../src/games/grid-snap/stores/gridSnapStore';
import { ReminderTimePicker } from '../../../src/games/word-hunt/components/ReminderTimePicker';
import { HeaderHomeButton } from '../../../src/shared/components/HeaderHomeButton';
import { useTheme } from '../../../src/shared/theme/useTheme';

export default function GridSnapSettingsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const difficulty = useGridSnapSettingsStore((s) => s.difficulty);
  const notificationsEnabled = useGridSnapSettingsStore((s) => s.notificationsEnabled);
  const reminderHour = useGridSnapSettingsStore((s) => s.reminderHour);
  const reminderMinute = useGridSnapSettingsStore((s) => s.reminderMinute);
  const hydrated = useGridSnapSettingsStore((s) => s.hydrated);
  const hydrate = useGridSnapSettingsStore((s) => s.hydrate);
  const setDifficulty = useGridSnapSettingsStore((s) => s.setDifficulty);
  const setNotificationsEnabled = useGridSnapSettingsStore((s) => s.setNotificationsEnabled);
  const setReminderTime = useGridSnapSettingsStore((s) => s.setReminderTime);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const handleDifficultyChange = useCallback(
    (value: typeof difficulty) => {
      void (async () => {
        await setDifficulty(value);
        await useGridSnapStore.getState().hydrateProgress();
      })();
    },
    [setDifficulty],
  );

  const onNotificationsToggle = useCallback(
    async (enabled: boolean) => {
      const result = await setNotificationsEnabled(enabled);
      if (!result.ok) {
        Alert.alert('Reminders unavailable', result.message);
      }
    },
    [setNotificationsEnabled],
  );

  const onReminderTimeChange = useCallback(
    async (hour: number, minute: number) => {
      const result = await setReminderTime(hour, minute);
      if (!result.ok) {
        Alert.alert('Reminders unavailable', result.message);
      }
    },
    [setReminderTime],
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <HeaderHomeButton onPress={() => router.replace('/games/grid-snap')} />
        <Text style={[styles.title, { color: theme.textPrimary }]}>Settings</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {hydrated ? (
            <>
              <DifficultyPicker difficulty={difficulty} onChange={handleDifficultyChange} />

              <View style={styles.divider} />

              <View style={styles.settingRow}>
                <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>Daily reminder</Text>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={(value) => void onNotificationsToggle(value)}
                />
              </View>

              <ReminderTimePicker
                hour={reminderHour}
                minute={reminderMinute}
                enabled={notificationsEnabled}
                onChange={(hour, minute) => void onReminderTimeChange(hour, minute)}
              />
            </>
          ) : (
            <Text style={[styles.loading, { color: theme.textSecondary }]}>Loading settings…</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  spacer: { width: 96 },
  content: { paddingHorizontal: 24, paddingBottom: 32 },
  card: { borderRadius: 12, borderWidth: 1, padding: 16, gap: 12 },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 36,
    gap: 12,
  },
  settingLabel: { fontSize: 15, fontWeight: '600' },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(128,128,128,0.25)',
  },
  loading: { fontSize: 14, textAlign: 'center' },
});
