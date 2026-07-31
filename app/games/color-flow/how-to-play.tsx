import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../../../src/shared/theme/useTheme';

const STEPS = [
  'Each color has two matching dots on the grid.',
  'Drag from a dot to draw an orthogonal path through empty cells.',
  'Dragging over another color takes that cell and cuts their path short.',
  'Drag back along your path to erase the tail.',
  'A flow locks once it reaches its matching dot. Drag back to change it.',
  'Tap either dot of a color to start that path over, or grab a drawn cell to pick it up from there.',
  'Reset board clears everything without changing the puzzle or the timer.',
  'Connect every pair and fill every cell to win.',
];

export default function ColorFlowHowToPlayScreen() {
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
            router.replace({ pathname: '/games/color-flow/play', params: { mode: 'practice' } })
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
  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: { fontSize: 22, fontWeight: '600' },
  title: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  headerSpacer: { width: 44 },
  content: { paddingHorizontal: 24, paddingBottom: 32, gap: 10 },
  stepCard: {
    flexDirection: 'row',
    gap: 12,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    alignItems: 'flex-start',
  },
  stepNumber: { fontSize: 18, fontWeight: '800', width: 20 },
  stepText: { flex: 1, fontSize: 15, lineHeight: 22 },
  playButton: {
    marginTop: 12,
    borderRadius: 10,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playText: { fontSize: 16, fontWeight: '700' },
  pressed: { opacity: 0.85 },
});
