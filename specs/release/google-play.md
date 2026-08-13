# Google Play release

Runbook for publishing Gridly on Google Play via [EAS Build](https://docs.expo.dev/build/introduction/) and [EAS Submit](https://docs.expo.dev/submit/android/).

## App identity

| Field | Value |
|-------|-------|
| Play Console app | Gridly |
| Android package | `com.gridlygames.app` |
| Privacy policy | https://sites.google.com/view/shaunakstudios-gridly/home |
| Delete account | https://sites.google.com/view/shaunakstudios-gridly/delete-account |
| Policy source in repo | [docs/legal/privacy-policy.md](../../docs/legal/privacy-policy.md) |
| Store listing copy | [docs/store/play-store-listing.md](../../docs/store/play-store-listing.md) |
| Feature graphic | `assets/store/feature-graphic.png` (1024×500) |
| App icon | `assets/icon.png` |
| Screenshots | `assets/store/screenshots/` (8 phone captures) |

## Phase 0 — Play Console (manual)

### Done

- [x] Google Play Developer account verified
- [x] App created in Play Console (`com.gridlygames.app`)
- [x] Privacy policy published — https://sites.google.com/view/shaunakstudios-gridly/home
- [x] Delete account page published — https://sites.google.com/view/shaunakstudios-gridly/delete-account
- [x] Main store listing complete (descriptions, icon, feature graphic, screenshots uploaded)
- [x] Data safety, content rating, target audience, sign-in details (per [play-store-listing.md](../../docs/store/play-store-listing.md))
- [x] Feature graphic — `assets/store/feature-graphic.png`
- [x] Screenshots — `assets/store/screenshots/01`–`08` (see [screenshots/README.md](../../assets/store/screenshots/README.md))
- [x] Invite edge functions redeployed with `com.gridlygames.app` package (`npm run supabase:deploy-invites`, Aug 2026)

### Remaining (Phase 0)

- [x] Publish delete-account page on Google Site

**Phase 0 status: complete** — store listing no longer appears as an open dashboard item.

## Phase 1 — Credentials (in progress)

Manual steps before first `eas build --profile production`:

1. Create a [Google Service Account](https://expo.fyi/creating-google-service-account) with Play Console API access.
2. Upload the JSON key to EAS (Dashboard → Credentials → Android → Service Credentials).
3. Set EAS **production** environment variables: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
4. After first production build, register Play App Signing SHA-1 in [Google Cloud OAuth](https://console.cloud.google.com/auth/clients?project=gridly-502816).
5. Set Supabase secret:
   ```bash
   npm run supabase secrets set INVITE_STORE_URL_ANDROID=https://play.google.com/store/apps/details?id=com.gridlygames.app
   ```

## Phase 2 — Repo configuration

- [x] `app.json` package `com.gridlygames.app`
- [x] `deepLink.ts` Android package aligned
- [x] `app.json` / `package.json` version `4.3.1`
- [x] `eas.json` submit profiles (`alpha` = closed testing) and production channel
- [x] `expo-updates` installed and configured
- [x] npm scripts: `build:production`, `build:production:submit`, `update:production`

## Phase 3 — CI/CD

- [x] `.github/workflows/ci.yml` — tests on PR/push
- [x] `.github/workflows/release-android.yml` — tag `v4.3.x` → build + submit
- [x] `.github/workflows/eas-update.yml` — manual OTA publish
- [ ] GitHub secret `EXPO_TOKEN` (add in repo settings before using workflows)

## Phase 4 — Closed testing (next)

```bash
npm run build:production:submit
```

Submits to **closed testing** (`alpha` track). Or use `eas submit --profile production` after a build.

1. Complete Phase 1 credentials if not done.
2. Device QA on the Play-installed build.
3. Promote toward production when satisfied.

Pause here until Phase 1 credentials are set, then run the production build.

### Sign-in details (reference)

**Answer: No** — no part of the app is restricted. Reviewers use **Continue as guest**.

## Phase 5 — Ongoing updates

| Change | Action |
|--------|--------|
| JS/UI/game logic | `eas update --channel production` |
| Native dependency or SDK bump | Bump version → tag → production build + submit |
| Supabase edge function | `npm run supabase:deploy-invites` etc. |
| Play listing only | Play Console |

See [versioning.md](./versioning.md).

## References

- [Expo — Submit to app stores](https://docs.expo.dev/deploy/submit-to-app-stores/)
- [Expo — Submit to Google Play](https://docs.expo.dev/submit/android/)
- [Expo — Send OTA updates](https://docs.expo.dev/deploy/send-over-the-air-updates/)
