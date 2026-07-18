import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { submitFeedback as submitFeedbackRow } from '../platform/sync/cloudRepository';
import type { FeedbackType } from '../platform/sync/types';

export async function submitFeedback(input: {
  userId: string | null;
  type: FeedbackType;
  message: string;
  contactEmail: string | null;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  return submitFeedbackRow({
    userId: input.userId,
    type: input.type,
    message: input.message.trim(),
    contactEmail: input.contactEmail?.trim() || null,
    appVersion: Constants.expoConfig?.version ?? 'unknown',
    platform: Platform.OS,
  });
}
