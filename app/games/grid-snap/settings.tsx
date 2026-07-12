import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { SnapDifficulty } from '../../../src/games/grid-snap/core/types';
import { useGridSnapSettingsStore } from '../../../src/games/grid-snap/stores/gridSnapSettingsStore';
import { HeaderHomeButton } from '../../../src/shared/components/HeaderHomeButton';
import { useTheme } from '../../../src/shared/theme/useTheme';

const DIFFICULTIES: SnapDifficulty[] = ['easy', 'medium', 'hard'];

const DIFFICULTY_LABELS: Record<SnapDifficulty, string> = {
  easy: 'Easy (4×4)',
  medium: 'Medium (6×6)',
  hard: 'Hard (8×8)',
};

export default function GridSnapSettingsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const difficulty = useGridSnapSettingsStore((s) => s.difficulty);
  const setDifficulty = useGridSnapSettingsStore((s) => s.setDifficulty);

  const cycleDifficulty = useCallback(() => {
    const index = DIFFICULTIES.indexOf(difficulty);
    const next = DIFFICULTIES[(index + 1) % DIFFICULTIES.length];
    void setDifficulty(next);
  }, [difficulty, setDifficulty]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <HeaderHomeButton onPress={() => router.replace('/games/grid-snap')} />
        <Text style={[styles.title, { color: theme.textPrimary }]}>Settings</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Pressable style={styles.settingRow} onPress={cycleDifficulty}>
            <View style={styles.settingCopy}>
              <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>Default difficulty</Text>
              <Text style={[styles.settingHint, { color: theme.textSecondary }]}>
                Used for new practice puzzles
              </Text>
            </View>
            <Text style={[styles.settingValue, { color: theme.textSecondary }]}>
              {DIFFICULTY_LABELS[difficulty]}
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
  content: { paddingHorizontal: 24, paddingBottom: 32 },
  card: { borderRadius: 12, borderWidth: 1, padding: 16 },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  settingCopy: { flex: 1 },
  settingLabel: { fontSize: 15, fontWeight: '600' },
  settingHint: { fontSize: 12, marginTop: 2 },
  settingValue: { fontSize: 14, fontWeight: '600' },
});
