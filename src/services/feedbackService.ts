import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { validateAuthEmail } from '../platform/auth/authValidation';
import { submitFeedback as submitFeedbackRow } from '../platform/sync/cloudRepository';
import type { FeedbackType } from '../platform/sync/types';

export async function submitFeedback(input: {
  userId: string | null;
  type: FeedbackType;
  message: string;
  contactEmail: string | null;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const trimmedMessage = input.message.trim();
  if (!trimmedMessage) {
    return { ok: false, message: 'Please enter your feedback before submitting.' };
  }

  const contactEmail = input.contactEmail?.trim() || null;
  if (contactEmail) {
    const emailError = validateAuthEmail(contactEmail);
    if (emailError) {
      return { ok: false, message: emailError };
    }
  }

  return submitFeedbackRow({
    userId: input.userId,
    type: input.type,
    message: trimmedMessage,
    contactEmail,
    appVersion: Constants.expoConfig?.version ?? 'unknown',
    platform: Platform.OS,
  });
}
