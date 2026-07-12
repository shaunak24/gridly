import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../../../src/shared/theme/useTheme';

const STEPS = [
  'A photo is split into a grid of tiles and shuffled on the board.',
  'Drag a tile or connected group to move it.',
  'When two tiles that belong together are placed side by side, they snap together with a glow.',
  'Connected groups move as one. Keep connecting until the full image is assembled in the dashed frame.',
];

export default function GridSnapHowToPlayScreen() {
  const router = useRouter();
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <Text style={[styles.closeText, { color: theme.textSecondary }]}>✕</Text>
        </Pressable>
        <Text style={[styles.title, { color: theme.textPrimary }]}>How to play</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {STEPS.map((step, index) => (
          <View key={step} style={[styles.stepCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.stepNumber, { color: theme.coral }]}>{index + 1}</Text>
            <Text style={[styles.stepText, { color: theme.textPrimary }]}>{step}</Text>
          </View>
        ))}

        <Pressable
          style={({ pressed }) => [
            styles.playButton,
            { backgroundColor: theme.coral },
            pressed && styles.pressed,
          ]}
          onPress={() =>
            router.replace({ pathname: '/games/grid-snap/play', params: { mode: 'practice' } })
          }
        >
          <Text style={[styles.playText, { color: theme.textPrimary }]}>Start practice</Text>
        </Pressable>
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
  closeButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  closeText: { fontSize: 20 },
  headerSpacer: { width: 44 },
  title: { fontSize: 20, fontWeight: '700' },
  content: { padding: 24, gap: 12 },
  stepCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  stepNumber: { fontSize: 18, fontWeight: '800', width: 20 },
  stepText: { flex: 1, fontSize: 16, lineHeight: 22 },
  playButton: {
    marginTop: 12,
    borderRadius: 10,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playText: { fontSize: 18, fontWeight: '700' },
  pressed: { opacity: 0.85 },
});
