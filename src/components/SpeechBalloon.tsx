import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../theme/useTheme';

interface SpeechBalloonProps {
  children: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function SpeechBalloon({ children, actionLabel, onAction }: SpeechBalloonProps) {
  const theme = useTheme();

  return (
    <View style={styles.wrapper}>
      <View style={[styles.bubble, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.text, { color: theme.textPrimary }]}>{children}</Text>
        {actionLabel && onAction ? (
          <Pressable
            onPress={onAction}
            style={({ pressed }) => [
              styles.actionButton,
              { backgroundColor: theme.coral },
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={actionLabel}
          >
            <Text style={[styles.actionText, { color: theme.textPrimary }]}>{actionLabel}</Text>
          </Pressable>
        ) : null}
      </View>
      <View style={[styles.tailBorder, { borderTopColor: theme.border }]} />
      <View style={[styles.tail, { borderTopColor: theme.card }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    marginBottom: 8,
  },
  bubble: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 14,
    maxWidth: 340,
    width: '100%',
    gap: 12,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  actionButton: {
    borderRadius: 10,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 16,
    fontWeight: '700',
  },
  pressed: { opacity: 0.85 },
  tail: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },
  tailBorder: {
    width: 0,
    height: 0,
    borderLeftWidth: 11,
    borderRightWidth: 11,
    borderTopWidth: 13,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginBottom: -12,
  },
});
