type AuthErrorLike = {
  message?: string;
  code?: string;
};

const AUTH_ERROR_BY_CODE: Record<string, string> = {
  invalid_credentials: 'Incorrect email or password.',
  email_address_invalid: 'Enter a valid email address.',
  validation_failed: 'Check your email and password, then try again.',
  user_already_registered: 'An account with this email already exists. Try signing in.',
  weak_password: 'Password must be at least 6 characters.',
  email_not_confirmed: 'Confirm your email address, then sign in.',
  signup_disabled: 'New sign-ups are not available right now.',
  over_request_rate_limit: 'Too many attempts. Wait a moment and try again.',
  session_expired: 'Your session expired. Sign in again.',
  user_not_found: 'Incorrect email or password.',
};

const MESSAGE_PATTERNS: Array<{ pattern: RegExp; message: string }> = [
  { pattern: /unable to validate email/i, message: 'Enter a valid email address.' },
  { pattern: /invalid email/i, message: 'Enter a valid email address.' },
  { pattern: /invalid login credentials/i, message: 'Incorrect email or password.' },
  { pattern: /email not confirmed/i, message: 'Confirm your email address, then sign in.' },
  { pattern: /user already registered/i, message: 'An account with this email already exists. Try signing in.' },
  { pattern: /password.*at least 6/i, message: 'Password must be at least 6 characters.' },
  { pattern: /rate limit/i, message: 'Too many attempts. Wait a moment and try again.' },
  { pattern: /network/i, message: 'Network error. Check your connection and try again.' },
  { pattern: /fetch failed/i, message: 'Network error. Check your connection and try again.' },
];

function mapAuthErrorMessage(message: string): string {
  const trimmed = message.trim();
  if (!trimmed) {
    return 'Something went wrong. Please try again.';
  }

  for (const { pattern, message: friendlyMessage } of MESSAGE_PATTERNS) {
    if (pattern.test(trimmed)) {
      return friendlyMessage;
    }
  }

  if (trimmed.length <= 120 && !/supabase|gotrue|postgres|jwt/i.test(trimmed)) {
    return trimmed.endsWith('.') ? trimmed : `${trimmed}.`;
  }

  return 'Something went wrong. Please try again.';
}

export function mapAuthError(error: AuthErrorLike | string | null | undefined): string {
  if (!error) {
    return 'Something went wrong. Please try again.';
  }

  if (typeof error === 'string') {
    return mapAuthErrorMessage(error);
  }

  const code = error.code?.toLowerCase();
  if (code && AUTH_ERROR_BY_CODE[code]) {
    return AUTH_ERROR_BY_CODE[code];
  }

  return mapAuthErrorMessage(error.message ?? '');
}
