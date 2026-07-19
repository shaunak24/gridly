import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { isAuthAvailable } from '../../src/platform/auth/authService';
import { validateAuthPasswordConfirmation } from '../../src/platform/auth/authValidation';
import { useAuthStore } from '../../src/platform/auth/authStore';
import { presentAuthMessage } from '../../src/platform/auth/presentAuthMessage';
import { presentAppMessage } from '../../src/shared/components/presentAppMessage';
import { HeaderBackButton } from '../../src/shared/components/HeaderBackButton';
import { useTheme } from '../../src/shared/theme/useTheme';

export default function SignUpScreen() {
  const router = useRouter();
  const theme = useTheme();
  const busy = useAuthStore((state) => state.busy);
  const signUp = useAuthStore((state) => state.signUp);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const onSignUp = useCallback(async () => {
    const passwordError = validateAuthPasswordConfirmation(password, confirmPassword);
    if (passwordError) {
      presentAppMessage({
        title: 'Check your password',
        body: passwordError,
        emoji: '⚠️',
      });
      return;
    }

    const message = await signUp(email.trim(), password);
    if (message) {
      presentAuthMessage(
        message,
        message.tone === 'info' ? () => router.replace('/auth/sign-in') : undefined,
      );
      return;
    }

    router.replace('/home');
  }, [confirmPassword, email, password, router, signUp]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <HeaderBackButton onPress={() => router.back()} />
        <Text style={[styles.title, { color: theme.textPrimary }]}>Create account</Text>
        <View style={styles.spacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {!isAuthAvailable() ? (
            <Text style={[styles.hint, { color: theme.textSecondary }]}>
              Cloud sign-up is not configured. Add Supabase environment variables to enable accounts.
            </Text>
          ) : null}

          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              placeholderTextColor={theme.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
              style={[styles.input, { color: theme.textPrimary, borderColor: theme.border }]}
            />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor={theme.textSecondary}
              secureTextEntry
              style={[styles.input, { color: theme.textPrimary, borderColor: theme.border }]}
            />
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm password"
              placeholderTextColor={theme.textSecondary}
              secureTextEntry
              style={[styles.input, { color: theme.textPrimary, borderColor: theme.border }]}
            />

            <Pressable
              style={[styles.primaryButton, { backgroundColor: theme.coral }]}
              onPress={() => void onSignUp()}
              disabled={busy || !isAuthAvailable()}
            >
              {busy ? (
                <ActivityIndicator color={theme.textPrimary} />
              ) : (
                <Text style={[styles.primaryText, { color: theme.textPrimary }]}>Create account</Text>
              )}
            </Pressable>

            <Pressable onPress={() => router.replace('/auth/sign-in')}>
              <Text style={[styles.link, { color: theme.coral }]}>Already have an account? Sign in</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  spacer: { width: 96 },
  content: { paddingHorizontal: 24, paddingBottom: 32, gap: 16 },
  hint: { fontSize: 14, lineHeight: 20 },
  card: { borderRadius: 12, borderWidth: 1, padding: 16, gap: 12 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  primaryButton: {
    minHeight: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: { fontSize: 16, fontWeight: '700' },
  link: { fontSize: 14, fontWeight: '600', textAlign: 'center' },
});
