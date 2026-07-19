import { useRouter } from 'expo-router';
import { useCallback, useEffect } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { isAuthAvailable } from '../src/platform/auth/authService';
import { useAuthStore } from '../src/platform/auth/authStore';
import { presentAuthMessage } from '../src/platform/auth/presentAuthMessage';
import { useWelcomeStore } from '../src/platform/auth/welcomeStore';
import { GoogleSignInButton } from '../src/platform/components/GoogleSignInButton';
import { GridLogo } from '../src/shared/components/GridLogo';
import { Wordmark } from '../src/shared/components/Wordmark';
import { useTheme } from '../src/shared/theme/useTheme';

export default function WelcomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const user = useAuthStore((state) => state.user);
  const authInitialized = useAuthStore((state) => state.initialized);
  const busy = useAuthStore((state) => state.busy);
  const signInGoogle = useAuthStore((state) => state.signInGoogle);
  const guestContinued = useWelcomeStore((state) => state.guestContinued);
  const welcomeHydrated = useWelcomeStore((state) => state.hydrated);
  const continueAsGuest = useWelcomeStore((state) => state.continueAsGuest);

  useEffect(() => {
    if (!authInitialized || !welcomeHydrated) {
      return;
    }

    if (user || guestContinued) {
      router.replace('/home');
    }
  }, [authInitialized, guestContinued, router, user, welcomeHydrated]);

  const onGoogle = useCallback(async () => {
    const message = await signInGoogle();
    if (message) {
      presentAuthMessage(message);
      return;
    }
    router.replace('/home');
  }, [router, signInGoogle]);

  const onContinueAsGuest = useCallback(async () => {
    await continueAsGuest();
    router.replace('/home');
  }, [continueAsGuest, router]);

  if (!authInitialized || !welcomeHydrated || user || guestContinued) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loading}>
          <ActivityIndicator color={theme.coral} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.hero}>
          <GridLogo size={120} />
          <Wordmark />
          <Text style={[styles.tagline, { color: theme.textSecondary }]}>
            Sign in to sync your progress, or continue as a guest.
          </Text>
        </View>

        <View style={styles.actions}>
          {isAuthAvailable() ? (
            <GoogleSignInButton onPress={() => void onGoogle()} busy={busy} />
          ) : (
            <Text style={[styles.hint, { color: theme.textSecondary }]}>
              Cloud sign-in is not configured. You can still play as a guest.
            </Text>
          )}

          <Pressable
            style={[styles.actionButton, { backgroundColor: theme.coral }]}
            onPress={() => router.push('/auth/sign-in')}
            disabled={!isAuthAvailable()}
          >
            <Text style={[styles.actionButtonText, { color: theme.textPrimary }]}>Sign in with email</Text>
          </Pressable>

          <Pressable
            style={[
              styles.actionButton,
              { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 },
            ]}
            onPress={() => router.push('/auth/sign-up')}
            disabled={!isAuthAvailable()}
          >
            <Text style={[styles.actionButtonText, { color: theme.textPrimary }]}>Create an account</Text>
          </Pressable>

          <Pressable onPress={() => void onContinueAsGuest()} style={styles.guestButton}>
            <Text style={[styles.guestText, { color: theme.textSecondary }]}>Continue as guest</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
    justifyContent: 'center',
    gap: 32,
  },
  hero: { alignItems: 'center', gap: 12 },
  tagline: { fontSize: 15, lineHeight: 22, textAlign: 'center', marginTop: 4 },
  actions: { gap: 12 },
  hint: { fontSize: 14, lineHeight: 20, textAlign: 'center' },
  actionButton: {
    minHeight: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  actionButtonText: { fontSize: 16, fontWeight: '700' },
  guestButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestText: { fontSize: 16, fontWeight: '600' },
});
