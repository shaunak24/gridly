const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateAuthEmail(email: string): string | null {
  const trimmed = email.trim();
  if (!trimmed) {
    return 'Enter your email address.';
  }

  if (!EMAIL_PATTERN.test(trimmed)) {
    return 'Enter a valid email address.';
  }

  return null;
}

export function validateAuthPassword(password: string): string | null {
  if (!password) {
    return 'Enter your password.';
  }

  if (password.length < 6) {
    return 'Password must be at least 6 characters.';
  }

  return null;
}

export function validateAuthPasswordConfirmation(
  password: string,
  confirmPassword: string,
): string | null {
  const passwordError = validateAuthPassword(password);
  if (passwordError) {
    return passwordError;
  }

  if (password !== confirmPassword) {
    return 'Passwords do not match.';
  }

  return null;
}
