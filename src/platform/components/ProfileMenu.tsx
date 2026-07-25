import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { isAuthAvailable } from '../auth/authService';
import { useAuthStore } from '../auth/authStore';
import { presentAuthMessage } from '../auth/presentAuthMessage';
import { useWelcomeStore } from '../auth/welcomeStore';
import { presentAppMessage } from '../../shared/components/presentAppMessage';
import { useTheme } from '../../shared/theme/useTheme';
import { GoogleSignInButton } from './GoogleSignInButton';

export function ProfileMenu() {
  const router = useRouter();
  const theme = useTheme();
  const user = useAuthStore((state) => state.user);
  const busy = useAuthStore((state) => state.busy);
  const signOut = useAuthStore((state) => state.signOut);
  const signInGoogle = useAuthStore((state) => state.signInGoogle);
  const clearGuest = useWelcomeStore((state) => state.clearGuest);
  const [visible, setVisible] = useState(false);

  const displayLabel = useMemo(() => {
    if (user?.email) {
      const localPart = user.email.split('@')[0] ?? 'User';
      return localPart.length > 12 ? `${localPart.slice(0, 11)}…` : localPart;
    }
    return 'Guest';
  }, [user]);

  const avatarLetter = useMemo(() => {
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'G';
  }, [user]);

  const onSignOut = useCallback(() => {
    presentAppMessage({
      title: 'Sign out',
      body: 'Your local data stays on this device.',
      primaryLabel: 'Sign out',
      onPrimary: () => {
        void (async () => {
          setVisible(false);
          await signOut();
          await clearGuest();
          router.replace('/');
        })();
      },
    });
  }, [clearGuest, router, signOut]);

  const onGoogle = useCallback(async () => {
    const message = await signInGoogle();
    if (message) {
      presentAuthMessage(message);
      return;
    }
    setVisible(false);
  }, [signInGoogle]);

  const openSignIn = useCallback(() => {
    setVisible(false);
    router.push('/auth/sign-in');
  }, [router]);

  const openSignUp = useCallback(() => {
    setVisible(false);
    router.push('/auth/sign-up');
  }, [router]);

  return (
    <>
      <Pressable
        onPress={() => setVisible(true)}
        style={({ pressed }) => [
          styles.trigger,
          { backgroundColor: theme.card, borderColor: theme.border },
          pressed && styles.pressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={user ? `Profile, signed in as ${user.email}` : 'Profile, playing as guest'}
      >
        <View style={[styles.avatar, { backgroundColor: user ? theme.coral : theme.tileEmpty }]}>
          <Text style={[styles.avatarText, { color: theme.textPrimary }]}>{avatarLetter}</Text>
        </View>
        <Text style={[styles.triggerLabel, { color: theme.textPrimary }]} numberOfLines={1}>
          {displayLabel}
        </Text>
      </Pressable>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          <Pressable
            style={[styles.sheet, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={(event) => event.stopPropagation()}
          >
            {user ? (
              <>
                <Text style={[styles.sheetTitle, { color: theme.textPrimary }]}>Signed in</Text>
                <Text style={[styles.email, { color: theme.textSecondary }]}>{user.email}</Text>
                <Text style={[styles.hint, { color: theme.textSecondary }]}>
                  Stats and settings sync across your devices.
                </Text>
                <Pressable
                  style={[styles.actionButton, { borderColor: theme.border, borderWidth: 1 }]}
                  onPress={onSignOut}
                  disabled={busy}
                >
                  <Text style={[styles.actionButtonText, { color: theme.textPrimary }]}>Sign out</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text style={[styles.sheetTitle, { color: theme.textPrimary }]}>Playing as guest</Text>
                <Text style={[styles.hint, { color: theme.textSecondary }]}>
                  Sign in to sync stats and settings across devices.
                </Text>

                {isAuthAvailable() ? (
                  <GoogleSignInButton onPress={() => void onGoogle()} busy={busy} />
                ) : null}

                <Pressable
                  style={[styles.actionButton, { backgroundColor: theme.coral }]}
                  onPress={openSignIn}
                  disabled={!isAuthAvailable()}
                >
                  <Text style={[styles.actionButtonText, { color: theme.textPrimary }]}>
                    Sign in with email
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.actionButton,
                    { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 },
                  ]}
                  onPress={openSignUp}
                  disabled={!isAuthAvailable()}
                >
                  <Text style={[styles.actionButtonText, { color: theme.textPrimary }]}>
                    Create an account
                  </Text>
                </Pressable>
              </>
            )}

            <Pressable onPress={() => setVisible(false)} style={styles.dismissButton}>
              <Text style={[styles.dismissText, { color: theme.textSecondary }]}>Close</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingRight: 12,
    paddingLeft: 6,
    borderRadius: 22,
    borderWidth: 1,
    maxWidth: 140,
  },
  pressed: { opacity: 0.85 },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 14, fontWeight: '700' },
  triggerLabel: { fontSize: 14, fontWeight: '600', flexShrink: 1 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  sheet: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 20,
    gap: 12,
  },
  sheetTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center' },
  email: { fontSize: 15, fontWeight: '600', textAlign: 'center' },
  hint: { fontSize: 13, lineHeight: 18, textAlign: 'center' },
  actionButton: {
    minHeight: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  actionButtonText: { fontSize: 16, fontWeight: '700' },
  dismissButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissText: { fontSize: 16, fontWeight: '600' },
});
