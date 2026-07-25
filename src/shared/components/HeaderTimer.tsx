import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../theme/useTheme';

interface HeaderTimerProps {
  display: string;
}

export function HeaderTimer({ display }: HeaderTimerProps) {
  const theme = useTheme();

  return (
    <View
      style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}
      accessibilityRole="text"
      accessibilityLabel={`Elapsed time ${display}`}
    >
      <Text style={[styles.time, { color: theme.textPrimary }]}>{display}</Text>
      <View style={[styles.iconBubble, { backgroundColor: theme.teal }]}>
        <Text style={[styles.iconText, { color: theme.textPrimary }]}>⏱</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingLeft: 14,
    paddingRight: 6,
    borderRadius: 22,
    borderWidth: 1,
    minHeight: 44,
  },
  time: {
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  iconBubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 14,
    lineHeight: 16,
  },
});
