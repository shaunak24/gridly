import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HeaderBackButton } from '../src/shared/components/HeaderBackButton';
import { useAppSettingsStore } from '../src/shared/stores/appSettingsStore';
import type { ThemePreference } from '../src/shared/theme/colors';
import { useTheme } from '../src/shared/theme/useTheme';

const THEME_ORDER: ThemePreference[] = ['dark', 'light', 'system'];

export default function AppSettingsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const themePref = useAppSettingsStore((s) => s.theme);
  const setTheme = useAppSettingsStore((s) => s.setTheme);

  const cycleTheme = useCallback(() => {
    const index = THEME_ORDER.indexOf(themePref);
    const next = THEME_ORDER[(index + 1) % THEME_ORDER.length];
    void setTheme(next);
  }, [themePref, setTheme]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <HeaderBackButton onPress={() => router.replace('/home')} />
        <Text style={[styles.title, { color: theme.textPrimary }]}>Settings</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Pressable style={styles.settingRow} onPress={cycleTheme}>
            <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>Theme</Text>
            <Text style={[styles.settingValue, { color: theme.textSecondary }]}>
              {themePref.charAt(0).toUpperCase() + themePref.slice(1)}
            </Text>
          </Pressable>

          <View style={styles.divider} />

          <Pressable style={styles.settingRow} onPress={() => router.push('/feedback')}>
            <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>Send feedback</Text>
            <Text style={[styles.settingValue, { color: theme.coral }]}>Open</Text>
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
    gap: 8,
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
  },
  settingLabel: { fontSize: 15, fontWeight: '600' },
  settingValue: { fontSize: 15, fontWeight: '600' },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(128,128,128,0.25)',
  },
});
