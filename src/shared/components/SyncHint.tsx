import { Text, StyleSheet } from 'react-native';

import { useIsSignedIn } from '../../platform/auth/authStore';
import { useTheme } from '../theme/useTheme';

export function SyncHint() {
  const theme = useTheme();
  const signedIn = useIsSignedIn();

  if (signedIn) {
    return null;
  }

  return (
    <Text style={[styles.hint, { color: theme.textSecondary }]}>
      Sign in from app settings to sync stats across devices.
    </Text>
  );
}

const styles = StyleSheet.create({
  hint: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 16,
  },
});
