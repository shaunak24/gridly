import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { SnapDifficulty } from '../../../src/games/grid-snap/core/types';
import { useGridSnapStatsStore } from '../../../src/games/grid-snap/stores/gridSnapStatsStore';
import { HeaderHomeButton } from '../../../src/shared/components/HeaderHomeButton';
import { ModePicker } from '../../../src/shared/components/ModePicker';
import { SyncHint } from '../../../src/shared/components/SyncHint';
import { useHardwareBack } from '../../../src/shared/hooks/useHardwareBack';
import { GRID_SNAP_STATS_MODES } from '../../../src/shared/stats/gridSnapModeStats';
import { averageElapsedSec } from '../../../src/shared/stats/timeAggregates';
import { useTheme } from '../../../src/shared/theme/useTheme';
import { formatElapsedOrDash } from '../../../src/shared/utils/formatElapsed';

const MODE_LABELS: Record<SnapDifficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

export default function GridSnapStatsScreen() {
  const router = useRouter();
  const theme = useTheme();
  useHardwareBack('/games/grid-snap');
  const [mode, setMode] = useState<SnapDifficulty>('easy');
  const stats = useGridSnapStatsStore((state) => state.getModeStats(mode));
  const daily = useGridSnapStatsStore((state) => state.getDailyStats());

  const { gamesPlayed, gamesWon, time } = stats;
  const winRate = gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0;
  const averageSec = averageElapsedSec(time);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <HeaderHomeButton onPress={() => router.replace('/games/grid-snap')} />
        <Text style={[styles.title, { color: theme.textPrimary }]}>Stats</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <SyncHint />

        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Daily challenge</Text>
        <View style={styles.row}>
          <StatCard label="Played" value={String(daily.gamesPlayed)} theme={theme} />
          <StatCard label="Streak" value={String(daily.currentStreak)} theme={theme} />
          <StatCard label="Max" value={String(daily.maxStreak)} theme={theme} />
        </View>

        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>By difficulty</Text>
        <ModePicker
          options={GRID_SNAP_STATS_MODES.map((value) => ({ value, label: MODE_LABELS[value] }))}
          value={mode}
          onChange={setMode}
        />

        <View style={styles.row}>
          <StatCard label="Played" value={String(gamesPlayed)} theme={theme} />
          <StatCard label="Win %" value={`${winRate}`} theme={theme} />
        </View>

        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Solve time</Text>
        <View style={styles.row}>
          <StatCard label="Fastest" value={formatElapsedOrDash(time.fastestSec)} theme={theme} />
          <StatCard label="Average" value={formatElapsedOrDash(averageSec)} theme={theme} />
          <StatCard label="Slowest" value={formatElapsedOrDash(time.slowestSec)} theme={theme} />
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
  cardValue: { fontSize: 22, fontWeight: '700' },
  cardLabel: { fontSize: 13, marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginTop: 8 },
});
