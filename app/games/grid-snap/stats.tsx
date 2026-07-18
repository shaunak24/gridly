import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useGridSnapStatsStore } from '../../../src/games/grid-snap/stores/gridSnapStatsStore';
import { HeaderHomeButton } from '../../../src/shared/components/HeaderHomeButton';
import { SyncHint } from '../../../src/shared/components/SyncHint';
import { useTheme } from '../../../src/shared/theme/useTheme';

export default function GridSnapStatsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { gamesPlayed, gamesWon, currentStreak, maxStreak } = useGridSnapStatsStore();
  const winRate = gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <HeaderHomeButton onPress={() => router.replace('/games/grid-snap')} />
        <Text style={[styles.title, { color: theme.textPrimary }]}>Stats</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <SyncHint />
        <View style={styles.row}>
          <StatCard label="Played" value={String(gamesPlayed)} theme={theme} />
          <StatCard label="Win %" value={`${winRate}`} theme={theme} />
        </View>
        <View style={styles.row}>
          <StatCard label="Streak" value={String(currentStreak)} theme={theme} />
          <StatCard label="Max" value={String(maxStreak)} theme={theme} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({
  label,
  value,
  theme,
}: {
  label: string;
  value: string;
  theme: ReturnType<typeof useTheme>;
}) {
  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Text style={[styles.cardValue, { color: theme.textPrimary }]}>{value}</Text>
      <Text style={[styles.cardLabel, { color: theme.textSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  spacer: { width: 96 },
  title: { fontSize: 18, fontWeight: '700', letterSpacing: 1 },
  content: { paddingVertical: 16, gap: 12 },
  row: { flexDirection: 'row', gap: 12 },
  card: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
  },
  cardValue: { fontSize: 28, fontWeight: '700' },
  cardLabel: { fontSize: 13, marginTop: 4 },
});
