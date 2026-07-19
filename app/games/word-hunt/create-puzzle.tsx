import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { isValidGuess } from '../../../src/games/word-hunt/core/gameEngine';
import { WORD_LENGTH } from '../../../src/games/word-hunt/core/types';
import { wordLists } from '../../../src/games/word-hunt/core/wordLists';
import { formatInviteShareMessage } from '../../../src/platform/invites/formatInviteShareMessage';
import { createInvite } from '../../../src/platform/invites/inviteService';
import { shareContent } from '../../../src/services/shareSheet';
import { HeaderHomeButton } from '../../../src/shared/components/HeaderHomeButton';
import { presentAppMessage } from '../../../src/shared/components/presentAppMessage';
import { useTheme } from '../../../src/shared/theme/useTheme';

export default function CreatePuzzleScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [word, setWord] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const normalized = word.toUpperCase().replace(/[^A-Z]/g, '').slice(0, WORD_LENGTH);

  const handleChange = (value: string) => {
    setWord(value);
    setError(null);
  };

  const validateWord = useCallback((): string | null => {
    if (normalized.length !== WORD_LENGTH) {
      setError('Enter a 5-letter word');
      return null;
    }

    if (!isValidGuess(normalized, wordLists.allowedGuessSet)) {
      setError('Not in word list');
      return null;
    }

    return normalized;
  }, [normalized]);

  const createShareInvite = useCallback(async () => {
    const validWord = validateWord();
    if (!validWord) {
      return null;
    }

    setIsSubmitting(true);
    try {
      const result = await createInvite('word-hunt', { mode: 'custom', word: validWord });
      if (!result.ok) {
        presentAppMessage({ title: 'Share failed', message: result.message });
        return null;
      }

      return result;
    } finally {
      setIsSubmitting(false);
    }
  }, [validateWord]);

  const handleShare = useCallback(async () => {
    const result = await createShareInvite();
    if (!result) {
      return;
    }

    const message = formatInviteShareMessage();

    try {
      await shareContent({
        title: 'Gridly puzzle',
        message,
        url: result.url,
      });
    } catch {
      presentAppMessage({
        title: 'Share failed',
        message: 'Could not open the share sheet.',
      });
    }
  }, [createShareInvite]);

  const handleCopyLink = useCallback(async () => {
    const result = await createShareInvite();
    if (!result) {
      return;
    }

    await Clipboard.setStringAsync(result.url);
    presentAppMessage({
      title: 'Link copied',
      message: 'Share it with a friend so they can play your puzzle.',
    });
  }, [createShareInvite]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <HeaderHomeButton onPress={() => router.replace('/games/word-hunt')} />
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Create puzzle</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Text style={[styles.description, { color: theme.textSecondary }]}>
          Pick a 5-letter word and send a link. Your friend taps it to play your puzzle in Gridly.
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
          editable={!isSubmitting}
        />

        {error ? <Text style={[styles.error, { color: theme.danger }]}>{error}</Text> : null}

        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            { backgroundColor: theme.coral },
            (pressed || isSubmitting) && styles.pressed,
          ]}
          onPress={() => void handleShare()}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color={theme.textPrimary} />
          ) : (
            <Text style={[styles.primaryText, { color: theme.textPrimary }]}>Share puzzle</Text>
          )}
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.secondaryButton,
            { borderColor: theme.border },
            (pressed || isSubmitting) && styles.pressed,
          ]}
          onPress={() => void handleCopyLink()}
          disabled={isSubmitting}
        >
          <Text style={[styles.secondaryText, { color: theme.textPrimary }]}>Copy link</Text>
        </Pressable>
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
  headerTitle: { fontSize: 18, fontWeight: '700', letterSpacing: 1 },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 24, gap: 16 },
  description: { fontSize: 16, lineHeight: 24, textAlign: 'center' },
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
  secondaryButton: {
    borderWidth: 1,
    borderRadius: 10,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: { fontSize: 18, fontWeight: '700' },
  secondaryText: { fontSize: 16, fontWeight: '600' },
  pressed: { opacity: 0.85 },
});
