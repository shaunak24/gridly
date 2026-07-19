import {
  validateAuthEmail,
  validateAuthPassword,
  validateAuthPasswordConfirmation,
} from '../authValidation';

describe('authValidation', () => {
  it('requires a valid email address', () => {
    expect(validateAuthEmail('')).toBe('Enter your email address.');
    expect(validateAuthEmail('not-an-email')).toBe('Enter a valid email address.');
    expect(validateAuthEmail('user@example.com')).toBeNull();
  });

  it('requires a password with at least 6 characters', () => {
    expect(validateAuthPassword('')).toBe('Enter your password.');
    expect(validateAuthPassword('12345')).toBe('Password must be at least 6 characters.');
    expect(validateAuthPassword('123456')).toBeNull();
  });

  it('requires matching passwords on sign up', () => {
    expect(validateAuthPasswordConfirmation('123456', '654321')).toBe('Passwords do not match.');
    expect(validateAuthPasswordConfirmation('123456', '123456')).toBeNull();
  });
});
