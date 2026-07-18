import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '../src/platform/auth/authStore';
import { useWelcomeStore } from '../src/platform/auth/welcomeStore';
import { GameCard } from '../src/platform/components/GameCard';
import { ProfileMenu } from '../src/platform/components/ProfileMenu';
import { GAMES } from '../src/platform/gameRegistry';
import { GridLogo } from '../src/shared/components/GridLogo';
import { HeaderIconButton } from '../src/shared/components/HeaderIconButton';
import { ThemeToggleButton } from '../src/shared/components/ThemeToggleButton';
import { Wordmark } from '../src/shared/components/Wordmark';
import { useTheme } from '../src/shared/theme/useTheme';

export default function PlatformHomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const user = useAuthStore((state) => state.user);
  const authInitialized = useAuthStore((state) => state.initialized);
  const guestContinued = useWelcomeStore((state) => state.guestContinued);
  const welcomeHydrated = useWelcomeStore((state) => state.hydrated);

  useEffect(() => {
    if (!authInitialized || !welcomeHydrated) {
      return;
    }

    if (!user && !guestContinued) {
      router.replace('/');
    }
  }, [authInitialized, guestContinued, router, user, welcomeHydrated]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.topBar}>
        <ProfileMenu />
        <View style={styles.topBarSpacer} />
        <View style={styles.topBarActions}>
          <ThemeToggleButton />
          <HeaderIconButton
            name="settings-outline"
            onPress={() => router.push('/settings')}
            accessibilityLabel="App settings"
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.content}>
          <GridLogo size={120} />
          <Wordmark />
          <Text style={[styles.tagline, { color: theme.textSecondary }]}>Grid-based games.</Text>
        </View>

        <View style={styles.cards}>
          {GAMES.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onPress={() => router.push(game.hubRoute)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
    gap: 8,
  },
  topBarSpacer: { flex: 1 },
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    gap: 12,
  },
  tagline: { fontSize: 16, textAlign: 'center' },
  cards: { gap: 12, marginTop: 32 },
});
