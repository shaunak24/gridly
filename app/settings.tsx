import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HeaderHomeButton } from '../src/components/HeaderHomeButton';
import { ReminderTimePicker } from '../src/components/ReminderTimePicker';
import { useSettingsStore } from '../src/stores/settingsStore';
import type { ThemePreference } from '../src/theme/colors';
import { useTheme } from '../src/theme/useTheme';

const THEME_ORDER: ThemePreference[] = ['dark', 'light', 'system'];

export default function SettingsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const hardMode = useSettingsStore((s) => s.hardMode);
  const notificationsEnabled = useSettingsStore((s) => s.notificationsEnabled);
  const reminderHour = useSettingsStore((s) => s.reminderHour);
  const reminderMinute = useSettingsStore((s) => s.reminderMinute);
  const themePref = useSettingsStore((s) => s.theme);
  const setHardMode = useSettingsStore((s) => s.setHardMode);
  const setNotificationsEnabled = useSettingsStore((s) => s.setNotificationsEnabled);
  const setReminderTime = useSettingsStore((s) => s.setReminderTime);
  const setTheme = useSettingsStore((s) => s.setTheme);

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

  const cycleTheme = useCallback(() => {
    const index = THEME_ORDER.indexOf(themePref);
    const next = THEME_ORDER[(index + 1) % THEME_ORDER.length];
    void setTheme(next);
  }, [themePref, setTheme]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <HeaderHomeButton onPress={() => router.replace('/')} />
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

          <View style={styles.divider} />

          <Pressable style={styles.settingRow} onPress={cycleTheme}>
            <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>Theme</Text>
            <Text style={[styles.settingValue, { color: theme.textSecondary }]}>
              {themePref.charAt(0).toUpperCase() + themePref.slice(1)}
            </Text>
          </Pressable>
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
  settingValue: { fontSize: 15, fontWeight: '600' },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(128,128,128,0.25)',
  },
});
