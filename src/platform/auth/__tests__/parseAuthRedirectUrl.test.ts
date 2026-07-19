import { parseAuthRedirectParams } from '../parseAuthRedirectUrl';

describe('parseAuthRedirectParams', () => {
  it('reads PKCE authorization codes from the query string', () => {
    expect(parseAuthRedirectParams('gridly://auth/callback?code=abc123')).toEqual({
      code: 'abc123',
    });
  });

  it('reads tokens from the URL hash fragment', () => {
    expect(
      parseAuthRedirectParams('gridly://auth/callback#access_token=token&refresh_token=refresh'),
    ).toEqual({
      access_token: 'token',
      refresh_token: 'refresh',
    });
  });

  it('merges query and hash parameters when both are present', () => {
    expect(
      parseAuthRedirectParams('gridly://auth/callback?state=xyz#access_token=token&refresh_token=refresh'),
    ).toEqual({
      state: 'xyz',
      access_token: 'token',
      refresh_token: 'refresh',
    });
  });
});
