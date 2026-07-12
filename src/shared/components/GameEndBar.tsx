import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../theme/useTheme';

export interface GameEndBarProps {
  message: string;
  onPlayAgain?: () => void;
  playAgainLabel?: string;
  playAgainDisabled?: boolean;
  onShare?: () => void;
  shareLabel?: string;
  prominent?: boolean;
}

export function GameEndBar({
  message,
  onPlayAgain,
  playAgainLabel = 'Play again',
  playAgainDisabled = false,
  onShare,
  shareLabel = 'Share',
  prominent = false,
}: GameEndBarProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, prominent && styles.containerProminent]}>
      <Text
        style={[
          styles.message,
          prominent && styles.messageProminent,
          { color: prominent ? theme.textPrimary : theme.textSecondary },
        ]}
      >
        {message}
      </Text>
      <View style={styles.actions}>
        {onShare ? (
          <Pressable
            style={({ pressed }) => [
              styles.secondaryButton,
              { backgroundColor: theme.card, borderColor: theme.border },
              pressed && styles.pressed,
            ]}
            onPress={onShare}
          >
            <Text style={[styles.secondaryText, { color: theme.textPrimary }]}>{shareLabel}</Text>
          </Pressable>
        ) : null}
        {onPlayAgain ? (
          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              { backgroundColor: theme.coral },
              playAgainDisabled && styles.disabledButton,
              pressed && !playAgainDisabled && styles.pressed,
            ]}
            onPress={onPlayAgain}
            disabled={playAgainDisabled}
          >
            <Text style={[styles.primaryText, { color: theme.textPrimary }]}>{playAgainLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 10, paddingVertical: 8, paddingHorizontal: 4 },
  containerProminent: { gap: 20, paddingVertical: 16 },
  message: { fontSize: 15, fontWeight: '600', textAlign: 'center' },
  messageProminent: { fontSize: 22, fontWeight: '700', lineHeight: 30 },
  actions: { flexDirection: 'row', gap: 8 },
  primaryButton: {
    flex: 1,
    borderRadius: 10,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 10,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  disabledButton: { opacity: 0.55 },
  primaryText: { fontSize: 16, fontWeight: '700' },
  secondaryText: { fontSize: 16, fontWeight: '600' },
  pressed: { opacity: 0.85 },
});
