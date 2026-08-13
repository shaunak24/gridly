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

## Important links

| Resource | URL |
|----------|-----|
| Expo project | https://expo.dev/accounts/shaunak-team/projects/gridly |
| EAS builds | https://expo.dev/accounts/shaunak-team/projects/gridly/builds |
| EAS submissions | https://expo.dev/accounts/shaunak-team/projects/gridly/submissions |
| Play Console | https://play.google.com/console/ |
| Google Cloud (OAuth) | https://console.cloud.google.com/auth/clients?project=gridly-502816 |
| Supabase dashboard | https://supabase.com/dashboard/project/dtdctaztwlfvbjnl |
| Privacy policy (live) | https://sites.google.com/view/shaunakstudios-gridly/home |
| Delete account (live) | https://sites.google.com/view/shaunakstudios-gridly/delete-account |

### Credentials

| Item | Value |
|------|-------|
| EAS account | `shaunakt24` / `@shaunak-team/gridly` |
| EAS project ID | `2bb4bcf9-2add-4f58-b3bf-df1a18f33351` |
| Google Play service account | `play-console-service-account@gridly-502816.iam.gserviceaccount.com` |
| Android upload keystore | EAS remote — Build Credentials `qEnMhdbB9R` (default) |

### First production build (v4.3.1, Aug 13 2026)

| Item | Value |
|------|-----|
| Build ID | `92fc499d-a399-4f72-87bf-991f4bd906f6` |
| Build page | https://expo.dev/accounts/shaunak-team/projects/gridly/builds/92fc499d-a399-4f72-87bf-991f4bd906f6 |
| AAB artifact | https://expo.dev/artifacts/eas/PBrBJ_DYbYMhqBulxX8oMpwPD7DwBrLY2AbClNWEUdo.aab |
| Failed submission (draft error) | https://expo.dev/accounts/shaunak-team/projects/gridly/submissions/ffc64fe2-2ced-4089-a3ec-5c27fa383156 |
| Successful submission | https://expo.dev/accounts/shaunak-team/projects/gridly/submissions/f73ed3c7-e3b2-4b90-b09d-a709c7abfe77 |
| App version | `4.3.1` (versionCode `2` on EAS remote) |
| Submit track | `alpha` (closed testing) |
| Closed test sent for review | Aug 13, 2026 |

## Closed testing → production roadmap

Google requires a **closed test** before **Apply for access to production**. Criteria shown in Play Console:

| Requirement | Status |
|-------------|--------|
| Publish a closed testing release | Done (v4.3.1 submitted via EAS) |
| At least **12 testers opted-in** | **0** — recruit testers |
| Closed test running **≥ 14 days** with those testers | Starts when release is live and testers opt in |

### Now — waiting for Google (closed testing review)

You sent the closed testing release for review. Typical wait: **a few hours to a few days**.

When approved, Play Console → **Testing** → **Closed testing** shows an **opt-in URL** (and email list management under **Testers**).

### As soon as the closed test is live (do within 1–2 days)

1. **Copy the opt-in link** — Play Console → Testing → Closed testing → **How testers join** / **Copy link**.
2. **Add testers** — email list or Google Group (need **12+** who will actually opt in and install).
3. **Install on your phone** via that link (not the old sideload APK) and run QA:
   - Guest play, all three games
   - Email + Google sign-in
   - Daily reminders
   - Word Hunt invite from browser
   - Feedback submit
4. **Google OAuth fix** — Play Console → **App integrity** → App signing key SHA-1 → add to [Google Cloud OAuth](https://console.cloud.google.com/auth/clients?project=gridly-502816) for `com.gridlygames.app`.
5. **Invite store button** (optional until public listing):
   ```bash
   npm run supabase secrets set INVITE_STORE_URL_ANDROID=https://play.google.com/store/apps/details?id=com.gridlygames.app
   ```

### During closed testing (14+ days)

- Share the opt-in URL with **at least 12 people** (friends, family, colleagues). They must:
  1. Open the link and **become a tester** (opt in)
  2. **Install from Play Store** (the testing build, not Expo Go)
- Fix bugs via `eas update --channel production` (JS-only) or a new `npm run build:production:submit` (native changes).
- Monitor Play Console → **Testing** → closed testing for opted-in tester count.

**14-day clock** starts when the release is **available to testers** and they are opted in — confirm the exact start date in Play Console.

### After 14 days with 12+ opted-in testers

1. Play Console → **Dashboard** or **Production** → **Apply for access to production**.
2. Answer Google's questions about your closed test (preview questions in Console).
3. Wait for production access approval.

### After production access is granted

1. Submit a release to the **production** track (`eas.json` profile `production-promote` uses `releaseStatus: completed`, or roll out manually in Console).
2. Complete any remaining store listing / policy tasks.
3. **Submit for production review** → public launch on Google Play.

### Pushing updates during closed testing

| Change type | Command |
|-------------|---------|
| JS / UI only | `npm run update:production` |
| Native / version bump | `npm run build:production:submit` (still `releaseStatus: draft` until first production ship) |

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

## Phase 1 — Credentials

- [x] Google Service Account created and invited in Play Console
- [x] Service account key uploaded to EAS (`play-console-service-account@gridly-502816.iam.gserviceaccount.com`)
- [x] EAS **production** env vars: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- [x] EAS login (`npm run eas login` as `shaunakt24`)
- [ ] Play App Signing SHA-1 → Google Cloud OAuth (after first successful Play install)
- [ ] Supabase `INVITE_STORE_URL_ANDROID` secret

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

## Phase 4 — Closed testing

- [x] Production AAB built (v4.3.1, versionCode 2)
- [x] Submitted to closed testing (`alpha`) as draft — [submission](https://expo.dev/accounts/shaunak-team/projects/gridly/submissions/f73ed3c7-e3b2-4b90-b09d-a709c7abfe77)
- [x] Release sent for Google review (Aug 13, 2026)
- [ ] Closed testing approved and live — share opt-in URL
- [ ] Device QA on Play-installed build
- [ ] 12+ testers opted in
- [ ] 14-day closed test period complete
- [ ] Apply for production access

See **Closed testing → production roadmap** above for timing.

### Re-submit existing AAB (no rebuild)

```bash
npm run eas submit -- --platform android --profile production --id 92fc499d-a399-4f72-87bf-991f4bd906f6
```

### Troubleshooting: draft app submit error

**Error:** `Only releases with status draft may be created on draft app.`

**Cause:** New Play Console apps are in **draft** until the first release is reviewed and rolled out from the Console UI. EAS cannot use `releaseStatus: "completed"` until the app has shipped at least once.

**Fix:** `eas.json` submit profiles use `"releaseStatus": "draft"`. EAS uploads the AAB as a **draft release** on the `alpha` track. Finish rollout in Play Console manually.

After the app is no longer a draft-only app, use the `production-promote` submit profile (`releaseStatus: "completed"`) for hands-off rollouts.

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
