import { mapAuthError } from '../authErrors';

describe('mapAuthError', () => {
  it('maps invalid email validation errors to a friendly message', () => {
    expect(mapAuthError('Unable to validate email address: invalid format')).toBe(
      'Enter a valid email address.',
    );
    expect(mapAuthError({ code: 'email_address_invalid', message: 'Email address is invalid' })).toBe(
      'Enter a valid email address.',
    );
  });

  it('maps invalid credentials to a friendly message', () => {
    expect(mapAuthError({ code: 'invalid_credentials', message: 'Invalid login credentials' })).toBe(
      'Incorrect email or password.',
    );
  });

  it('maps user already registered errors', () => {
    expect(mapAuthError({ message: 'User already registered' })).toBe(
      'An account with this email already exists. Try signing in.',
    );
  });

  it('falls back to a generic message for technical errors', () => {
    expect(mapAuthError({ message: 'PostgREST error from supabase gotrue' })).toBe(
      'Something went wrong. Please try again.',
    );
  });
});
