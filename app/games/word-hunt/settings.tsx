import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ReminderTimePicker } from '../../../src/games/word-hunt/components/ReminderTimePicker';
import { useWordHuntSettingsStore } from '../../../src/games/word-hunt/stores/wordHuntSettingsStore';
import { HeaderHomeButton } from '../../../src/shared/components/HeaderHomeButton';
import { useTheme } from '../../../src/shared/theme/useTheme';

export default function WordHuntSettingsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const hardMode = useWordHuntSettingsStore((s) => s.hardMode);
  const notificationsEnabled = useWordHuntSettingsStore((s) => s.notificationsEnabled);
  const reminderHour = useWordHuntSettingsStore((s) => s.reminderHour);
  const reminderMinute = useWordHuntSettingsStore((s) => s.reminderMinute);
  const setHardMode = useWordHuntSettingsStore((s) => s.setHardMode);
  const setNotificationsEnabled = useWordHuntSettingsStore((s) => s.setNotificationsEnabled);
  const setReminderTime = useWordHuntSettingsStore((s) => s.setReminderTime);

  const onNotificationsToggle = useCallback(async (enabled: boolean) => {
    const result = await setNotificationsEnabled(enabled);
    if (!result.ok) {
      Alert.alert('Reminders unavailable', result.message);
    }
  }, [setNotificationsEnabled]);

  const onReminderTimeChange = useCallback(async (hour: number, minute: number) => {
    const result = await setReminderTime(hour, minute);
    if (!result.ok) {
      Alert.alert('Reminders unavailable', result.message);
    }
  }, [setReminderTime]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <HeaderHomeButton onPress={() => router.replace('/games/word-hunt')} />
        <Text style={[styles.title, { color: theme.textPrimary }]}>Settings</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.settingRow}>
            <View style={styles.settingCopy}>
              <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>Hard mode</Text>
              <Text style={[styles.settingHint, { color: theme.textSecondary }]}>
                Revealed hints must be used in every guess
              </Text>
            </View>
            <Switch value={hardMode} onValueChange={(v) => void setHardMode(v)} />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>Daily reminder</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={(v) => void onNotificationsToggle(v)}
            />
          </View>

          <ReminderTimePicker
            hour={reminderHour}
            minute={reminderMinute}
            enabled={notificationsEnabled}
            onChange={(hour, minute) => void onReminderTimeChange(hour, minute)}
          />
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
  content: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 36,
    gap: 12,
  },
  settingCopy: { flex: 1 },
  settingLabel: { fontSize: 15, fontWeight: '600' },
  settingHint: { fontSize: 12, marginTop: 2 },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(128,128,128,0.25)',
  },
});
