import { StyleSheet, Text } from 'react-native';

import { useTheme } from '../theme/useTheme';

export function Wordmark() {
  const theme = useTheme();

  return (
    <Text
      style={[styles.wordmark, { color: theme.textPrimary }]}
      accessibilityRole="header"
    >
      Gr
      <Text style={{ color: theme.coral }}>i</Text>
      dly
    </Text>
  );
}

const styles = StyleSheet.create({
  wordmark: {
    fontSize: 48,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
