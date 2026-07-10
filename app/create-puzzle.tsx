import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HeaderHomeButton } from '../src/components/HeaderHomeButton';
import {
  buildCustomPuzzleLink,
  formatCustomPuzzleShareMessage,
} from '../src/core/customPuzzle';
import { isValidGuess } from '../src/core/gameEngine';
import { WORD_LENGTH } from '../src/core/types';
import { wordLists } from '../src/core/wordLists';
import { shareContent } from '../src/services/shareSheet';
import { useTheme } from '../src/theme/useTheme';

export default function CreatePuzzleScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [word, setWord] = useState('');
  const [error, setError] = useState<string | null>(null);

  const normalized = word.toUpperCase().replace(/[^A-Z]/g, '').slice(0, WORD_LENGTH);

  const handleChange = (value: string) => {
    setWord(value);
    setError(null);
  };

  const handleShare = useCallback(async () => {
    if (normalized.length !== WORD_LENGTH) {
      setError('Enter a 5-letter word');
      return;
    }

    if (!isValidGuess(normalized, wordLists.allowedGuessSet)) {
      setError('Not in word list');
      return;
    }

    const link = buildCustomPuzzleLink(normalized);
    const message = formatCustomPuzzleShareMessage(link);

    try {
      await shareContent({
        title: 'Gridly puzzle',
        message,
        url: link,
      });
    } catch {
      Alert.alert('Share failed', 'Could not open the share sheet.');
    }
  }, [normalized]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <HeaderHomeButton onPress={() => router.replace('/')} />
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Create puzzle</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Text style={[styles.description, { color: theme.textSecondary }]}>
          Pick a 5-letter word and share it with a friend. They open the link to play your puzzle.
        </Text>

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.card,
              borderColor: error ? theme.danger : theme.border,
              color: theme.textPrimary,
            },
          ]}
          value={word}
          onChangeText={handleChange}
          placeholder="Enter word"
          placeholderTextColor={theme.textSecondary}
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={WORD_LENGTH}
          accessibilityLabel="Custom puzzle word"
        />

        {error ? <Text style={[styles.error, { color: theme.danger }]}>{error}</Text> : null}

        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            { backgroundColor: theme.coral },
            pressed && styles.pressed,
          ]}
          onPress={() => void handleShare()}
        >
          <Text style={[styles.primaryText, { color: theme.textPrimary }]}>Share puzzle</Text>
        </Pressable>

        <Text style={[styles.hint, { color: theme.textSecondary }]}>
          Custom app links may not be tappable in WhatsApp. Paste the link in your browser if needed.
        </Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  headerSpacer: { width: 96 },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    gap: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    minHeight: 52,
    paddingHorizontal: 16,
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 8,
    textAlign: 'center',
  },
  error: { fontSize: 14, fontWeight: '600', textAlign: 'center' },
  primaryButton: {
    borderRadius: 10,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  primaryText: { fontSize: 18, fontWeight: '700' },
  hint: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  pressed: { opacity: 0.85 },
});
