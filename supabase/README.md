# Supabase setup for Gridly V3

## 1. Create project

1. Sign up at [supabase.com](https://supabase.com)
2. Create a new project (free tier is fine for development)

## 2. Run database migrations

In the Supabase SQL editor, run **in order**:

1. `migrations/001_v3_initial.sql`
2. `migrations/002_user_profile_trigger.sql`
3. `migrations/003_game_invites.sql`

## 3. Configure auth

### Development setup (email/password, no confirmation)

Gridly dev uses **Confirm email OFF** so sign-up signs you in immediately (no confirmation mail).

1. **Authentication → Providers → Email**
   - Enable email/password
   - Turn **off** “Confirm email”
   - Save
2. **Authentication → URL Configuration** — add redirect URLs (for Google OAuth later):
   - `gridly://auth/callback`
3. If you already signed up with confirmation on, delete that user under **Authentication → Users**, then create the account again in the app.

After sign-up you should land on home signed in. Check **Authentication → Users** and **`user_profiles`** (after migration `002`).

### Google OAuth (optional)

Enable in Supabase; use a Web OAuth client from [Google Cloud Console](https://console.cloud.google.com/auth/clients?project=gridly-502816). Device testing requires a dev build (`npm run build:apk`), not Expo Go.

### Production email confirmation (later)

If you turn **Confirm email** back on for production:

- Configure **Project Settings → Authentication → SMTP** (e.g. Resend, SendGrid)
- Add `gridly://auth/callback` under **URL Configuration**
- Check **Authentication → Logs** if mail does not arrive

### Where users are stored

| Location | What it holds |
|----------|----------------|
| **Authentication → Users** (`auth.users`) | Accounts (email, confirmed or not) |
| **`public.user_profiles`** | App profile row per user (created by migration `002` trigger on sign-up) |
| Stats/settings tables | Filled on first sign-in when cloud sync runs |

If `user_profiles` is empty after sign-up, run migration `002` and check **Authentication → Users**.

## 4. App environment

Copy `.env.example` to `.env` in the project root:

```
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
# Optional — defaults to {SUPABASE_URL}/functions/v1/resolve-invite
EXPO_PUBLIC_INVITE_LINK_BASE=https://xxxx.supabase.co/functions/v1/resolve-invite
```

Restart Expo after changing env vars.

## 5. Game invite Edge Functions (v3.1)

Deploy after running migration `003` (use local CLI — do not install `supabase` globally on a work laptop):

```bash
npm install --legacy-peer-deps   # if node_modules missing
npm run supabase login           # one-time browser login
npm run supabase link -- --project-ref YOUR_PROJECT_REF
npm run supabase:deploy-invites
```

Or deploy individually:

```bash
npm run supabase functions deploy create-invite
npm run supabase functions deploy resolve-invite
```

`create-invite` uses the service role key (provided automatically in the Edge Function runtime). Invites expire after 90 days.

`supabase/config.toml` sets `verify_jwt = false` for invite functions so guests and WhatsApp/browser taps work without a user session.

Share links use:
`https://{project-ref}.supabase.co/functions/v1/resolve-invite/{invite-id}`

Optional: set `INVITE_LINK_BASE` as a function secret if you later use a custom domain for invite URLs.

## 6. Feedback email (optional)

1. Create a [Resend](https://resend.com) account
2. Deploy the Edge Function:

```bash
supabase functions deploy send-feedback-notification
supabase secrets set RESEND_API_KEY=re_xxx FEEDBACK_TO_EMAIL=you@example.com
```

3. In Supabase dashboard, add a **Database Webhook** on `feedback` table INSERT → invoke `send-feedback-notification`

## 7. Test on device

Rebuild the APK after auth changes:

```bash
npm run build:apk
```

OAuth and local reminders require a development build, not Expo Go.

Email/password sign-up works in Expo Go when `.env` points at your Supabase project.
