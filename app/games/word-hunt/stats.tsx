import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useStatsStore } from '../../../src/games/word-hunt/stores/statsStore';
import { HeaderHomeButton } from '../../../src/shared/components/HeaderHomeButton';
import { ModePicker } from '../../../src/shared/components/ModePicker';
import { SyncHint } from '../../../src/shared/components/SyncHint';
import { averageElapsedSec } from '../../../src/shared/stats/timeAggregates';
import {
  WORD_HUNT_MODES,
  type WordHuntMode,
} from '../../../src/shared/stats/wordHuntModeStats';
import { useHardwareBack } from '../../../src/shared/hooks/useHardwareBack';
import { useTheme } from '../../../src/shared/theme/useTheme';
import { formatElapsedOrDash } from '../../../src/shared/utils/formatElapsed';

const MODE_LABELS: Record<WordHuntMode, string> = {
  daily: 'Daily',
  practice: 'Practice',
  custom: 'Custom',
};

export default function WordHuntStatsScreen() {
  const router = useRouter();
  const theme = useTheme();
  useHardwareBack('/games/word-hunt');
  const [mode, setMode] = useState<WordHuntMode>('daily');
  const stats = useStatsStore((state) => state.getModeStats(mode));

  const { gamesPlayed, gamesWon, currentStreak, maxStreak, distribution, time } = stats;
  const winRate = gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0;
  const maxDist = Math.max(...distribution, 1);
  const averageSec = averageElapsedSec(time);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <HeaderHomeButton onPress={() => router.replace('/games/word-hunt')} />
        <Text style={[styles.title, { color: theme.textPrimary }]}>Stats</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <SyncHint />
        <ModePicker
          options={WORD_HUNT_MODES.map((value) => ({ value, label: MODE_LABELS[value] }))}
          value={mode}
          onChange={setMode}
        />

        <View style={styles.row}>
          <StatCard label="Played" value={String(gamesPlayed)} theme={theme} />
          <StatCard label="Win %" value={`${winRate}`} theme={theme} />
        </View>
        <View style={styles.row}>
          <StatCard label="Streak" value={String(currentStreak)} theme={theme} />
          <StatCard label="Max" value={String(maxStreak)} theme={theme} />
        </View>

        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Solve time</Text>
        <View style={styles.row}>
          <StatCard label="Fastest" value={formatElapsedOrDash(time.fastestSec)} theme={theme} />
          <StatCard label="Average" value={formatElapsedOrDash(averageSec)} theme={theme} />
          <StatCard label="Slowest" value={formatElapsedOrDash(time.slowestSec)} theme={theme} />
        </View>

        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Guess distribution</Text>
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <DistRow
            key={n}
            label={String(n)}
            count={distribution[n - 1]}
            max={maxDist}
            theme={theme}
          />
        ))}
        <DistRow label="X" count={distribution[6]} max={maxDist} theme={theme} />
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

function DistRow({
  label,
  count,
  max,
  theme,
}: {
  label: string;
  count: number;
  max: number;
  theme: ReturnType<typeof useTheme>;
}) {
  const width = `${Math.max((count / max) * 100, count > 0 ? 12 : 4)}%`;
  return (
    <View style={styles.distRow}>
      <Text style={[styles.distLabel, { color: theme.textSecondary }]}>{label}</Text>
      <View style={[styles.distTrack, { backgroundColor: theme.tileEmpty }]}>
        <View style={[styles.distBar, { backgroundColor: theme.teal, width: width as `${number}%` }]} />
      </View>
      <Text style={[styles.distCount, { color: theme.textSecondary }]}>{count}</Text>
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
  distRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  distLabel: { width: 16, fontWeight: '700' },
  distTrack: { flex: 1, height: 24, borderRadius: 4, overflow: 'hidden' },
  distBar: { height: '100%', borderRadius: 4, minWidth: 8 },
  distCount: { width: 24, textAlign: 'right' },
});
