# Supabase setup for Gridly V3

## 1. Create project

1. Sign up at [supabase.com](https://supabase.com)
2. Create a new project (free tier is fine for development)

## 2. Run database migration

In the Supabase SQL editor, run the contents of:

`migrations/001_v3_initial.sql`

## 3. Configure auth

1. **Authentication → Providers → Email** — enable email/password
2. **Authentication → URL Configuration** — add redirect URL: `gridly://auth/callback`
3. **Google** — enable in Supabase; use Web OAuth client from Google Cloud Console (requires dev build for device testing)

## 4. App environment

Copy `.env.example` to `.env` in the project root:

```
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

Restart Expo after changing env vars.

## 5. Feedback email (optional)

1. Create a [Resend](https://resend.com) account
2. Deploy the Edge Function:

```bash
supabase functions deploy send-feedback-notification
supabase secrets set RESEND_API_KEY=re_xxx FEEDBACK_TO_EMAIL=you@example.com
```

3. In Supabase dashboard, add a **Database Webhook** on `feedback` table INSERT → invoke `send-feedback-notification`

## 6. Test on device

Rebuild the APK after auth changes:

```bash
npm run build:apk
```

OAuth and local reminders require a development build, not Expo Go.
