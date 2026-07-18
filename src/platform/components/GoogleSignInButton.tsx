import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../shared/theme/useTheme';

interface GoogleSignInButtonProps {
  onPress: () => void;
  disabled?: boolean;
  busy?: boolean;
  label?: string;
}

export function GoogleSignInButton({
  onPress,
  disabled = false,
  busy = false,
  label = 'Continue with Google',
}: GoogleSignInButtonProps) {
  const theme = useTheme();

  return (
    <Pressable
      style={[
        styles.button,
        { backgroundColor: theme.card, borderColor: theme.border },
        (disabled || busy) && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled || busy}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {busy ? (
        <ActivityIndicator color={theme.textPrimary} />
      ) : (
        <View style={styles.content}>
          <Ionicons name="logo-google" size={20} color="#4285F4" />
          <Text style={[styles.label, { color: theme.textPrimary }]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  disabled: { opacity: 0.6 },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
  },
});
