import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { useAuthStore } from '../../src/platform/auth/authStore';
import { GoogleSignInButton } from '../../src/platform/components/GoogleSignInButton';
import { HeaderBackButton } from '../../src/shared/components/HeaderBackButton';
import { useTheme } from '../../src/shared/theme/useTheme';

export default function SignInScreen() {
  const router = useRouter();
  const theme = useTheme();
  const busy = useAuthStore((state) => state.busy);
  const signIn = useAuthStore((state) => state.signIn);
  const signInGoogle = useAuthStore((state) => state.signInGoogle);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onSignIn = useCallback(async () => {
    const error = await signIn(email.trim(), password);
    if (error) {
      Alert.alert('Sign in failed', error);
      return;
    }
    router.replace('/home');
  }, [email, password, router, signIn]);

  const onGoogle = useCallback(async () => {
    const error = await signInGoogle();
    if (error) {
      Alert.alert('Sign in failed', error);
      return;
    }
    router.replace('/home');
  }, [router, signInGoogle]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <HeaderBackButton onPress={() => router.back()} label="Back" />
        <Text style={[styles.title, { color: theme.textPrimary }]}>Sign in</Text>
        <View style={styles.spacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {!isAuthAvailable() ? (
            <Text style={[styles.hint, { color: theme.textSecondary }]}>
              Cloud sign-in is not configured. Add Supabase environment variables to enable accounts.
            </Text>
          ) : null}

          {isAuthAvailable() ? (
            <GoogleSignInButton onPress={() => void onGoogle()} busy={busy} />
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

            <Pressable
              style={[styles.primaryButton, { backgroundColor: theme.coral }]}
              onPress={() => void onSignIn()}
              disabled={busy}
            >
              {busy ? (
                <ActivityIndicator color={theme.textPrimary} />
              ) : (
                <Text style={[styles.primaryText, { color: theme.textPrimary }]}>Sign in</Text>
              )}
            </Pressable>

            <Pressable onPress={() => router.push('/auth/sign-up')}>
              <Text style={[styles.link, { color: theme.coral }]}>Create an account</Text>
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
