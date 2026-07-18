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

import { useAuthStore } from '../src/platform/auth/authStore';
import { isAuthAvailable } from '../src/platform/auth/authService';
import { submitFeedback } from '../src/services/feedbackService';
import type { FeedbackType } from '../src/platform/sync/types';
import { HeaderBackButton } from '../src/shared/components/HeaderBackButton';
import { useTheme } from '../src/shared/theme/useTheme';

export default function FeedbackScreen() {
  const router = useRouter();
  const theme = useTheme();
  const user = useAuthStore((state) => state.user);
  const [type, setType] = useState<FeedbackType>('feedback');
  const [message, setMessage] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = useCallback(async () => {
    if (!message.trim()) {
      Alert.alert('Message required', 'Please enter your feedback before submitting.');
      return;
    }

    if (!isAuthAvailable()) {
      Alert.alert(
        'Cloud not configured',
        'Feedback requires Supabase to be set up. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to your environment.',
      );
      return;
    }

    setSubmitting(true);
    try {
      const result = await submitFeedback({
        userId: user?.id ?? null,
        type,
        message,
        contactEmail: user?.email ?? contactEmail,
      });

      if (!result.ok) {
        Alert.alert('Could not send feedback', result.message);
        return;
      }

      Alert.alert('Thank you', 'Your feedback has been sent.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } finally {
      setSubmitting(false);
    }
  }, [contactEmail, message, router, type, user]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <HeaderBackButton onPress={() => router.back()} />
        <Text style={[styles.title, { color: theme.textPrimary }]}>Feedback</Text>
        <View style={styles.spacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.label, { color: theme.textPrimary }]}>Type</Text>
            <View style={styles.typeRow}>
              <TypeButton
                label="Feedback"
                selected={type === 'feedback'}
                onPress={() => setType('feedback')}
                theme={theme}
              />
              <TypeButton
                label="Report a bug"
                selected={type === 'bug'}
                onPress={() => setType('bug')}
                theme={theme}
              />
            </View>

            <Text style={[styles.label, { color: theme.textPrimary }]}>Message</Text>
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Tell us what you think or what went wrong"
              placeholderTextColor={theme.textSecondary}
              multiline
              style={[
                styles.input,
                styles.messageInput,
                { color: theme.textPrimary, borderColor: theme.border },
              ]}
            />

            {!user ? (
              <>
                <Text style={[styles.label, { color: theme.textPrimary }]}>Email (optional)</Text>
                <TextInput
                  value={contactEmail}
                  onChangeText={setContactEmail}
                  placeholder="you@example.com"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={[styles.input, { color: theme.textPrimary, borderColor: theme.border }]}
                />
              </>
            ) : null}

            <Pressable
              style={[styles.submitButton, { backgroundColor: theme.coral }]}
              onPress={() => void onSubmit()}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color={theme.textPrimary} />
              ) : (
                <Text style={[styles.submitText, { color: theme.textPrimary }]}>Send feedback</Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function TypeButton({
  label,
  selected,
  onPress,
  theme,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  theme: ReturnType<typeof useTheme>;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.typeButton,
        {
          borderColor: selected ? theme.coral : theme.border,
          backgroundColor: selected ? 'rgba(249,115,22,0.12)' : 'transparent',
        },
      ]}
    >
      <Text style={[styles.typeButtonText, { color: theme.textPrimary }]}>{label}</Text>
    </Pressable>
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
  content: { paddingHorizontal: 24, paddingBottom: 32 },
  card: { borderRadius: 12, borderWidth: 1, padding: 16, gap: 12 },
  label: { fontSize: 15, fontWeight: '600' },
  typeRow: { flexDirection: 'row', gap: 10 },
  typeButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  typeButtonText: { fontSize: 14, fontWeight: '600', textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  messageInput: { minHeight: 140, textAlignVertical: 'top' },
  submitButton: {
    marginTop: 8,
    minHeight: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: { fontSize: 16, fontWeight: '700' },
});
