import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../theme/useTheme';

interface HeaderBackButtonProps {
  onPress: () => void;
  label?: string;
}

export function HeaderBackButton({ onPress, label = 'Gridly' }: HeaderBackButtonProps) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: theme.card, borderColor: theme.border },
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Back to ${label}`}
    >
      <View style={[styles.chevronBubble, { backgroundColor: theme.coral }]}>
        <Text style={[styles.chevronText, { color: theme.textPrimary }]}>‹</Text>
      </View>
      <Text style={[styles.label, { color: theme.textPrimary }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingRight: 14,
    paddingLeft: 6,
    borderRadius: 22,
    borderWidth: 1,
    minHeight: 44,
  },
  pressed: { opacity: 0.85 },
  chevronBubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevronText: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 24,
    marginTop: -2,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
  },
});
