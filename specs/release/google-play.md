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
| Publish a closed testing release | Done (v4.3.1 live; v4.3.2 submitted Aug 14, 2026) |
| At least **12 testers opted-in** | **15** opted in (Aug 2026) |
| Closed test running **≥ 14 days** with those testers | In progress (~day 2 as of Aug 14, 2026) |

### Closed testing active

Closed testing is live with an opt-in URL. Testers install from Play Store (not Expo Go or sideload APK).

**QA checklist** (Play-installed build):

- Guest play, all three games
- Email + Google sign-in
- Daily reminders
- Word Hunt invite from browser
- Feedback submit

**Remaining setup:**

- [ ] Play App Signing SHA-1 → [Google Cloud OAuth](https://console.cloud.google.com/auth/clients?project=gridly-502816) for `com.gridlygames.app`
- [ ] Supabase `INVITE_STORE_URL_ANDROID` secret (optional until public listing):
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

**Uploading a new version to the same closed testing track does not reset the 14-day tester clock.** The clock tracks continuous opt-in of 12+ testers, not the AAB version.

## Closed testing release log

Record each build pushed to the closed testing (`alpha`) track. Use this when answering Google's production-access questionnaire.

| Version | versionCode | Track | Date | Play Console issues | Resolution |
|---------|-------------|-------|------|---------------------|------------|
| 4.3.1 | 2 | alpha | Aug 13, 2026 | Initial closed test | First Play submission |
| 4.3.2 | 3 | alpha | Aug 14, 2026 | (1) BOOT_COMPLETED + restricted FGS; (2) edge-to-edge deprecated APIs; (3) portrait orientation | (1) `withDisableNotificationsBootActions`; (2) upstream advisory; (3) `withAndroidGameCategory` — see [v4.3.2.md](../versions/v4.3.2.md) |

### Production access questionnaire prep

When applying for production access (~14 days after 12+ testers opt in), Google asks what you tested and fixed. Draft answers:

- **What was tested:** Guest play (Word Hunt, Grid Snap, Color Flow), email + Google sign-in, daily reminders, Word Hunt invite from browser, feedback submit
- **Issues found:** Play Console pre-release report flagged Android 15 BOOT_COMPLETED vs foreground-service conflict, edge-to-edge deprecated APIs (upstream), portrait lock on large screens
- **Fixes shipped:** v4.3.2 manifest plugins for notifications boot receiver and game category; edge-to-edge noted as dependency-stack advisory with no user impact

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
- [x] `app.json` / `package.json` version `4.3.2`
- [x] `eas.json` submit profiles (`alpha` = closed testing) and production channel
- [x] `expo-updates` installed and configured
- [x] npm scripts: `build:production`, `build:production:submit`, `update:production`

## Phase 3 — CI/CD

- [x] `.github/workflows/ci.yml` — tests on PR/push
- [x] `.github/workflows/release-android.yml` — tag `v4.3.x` → EAS build + submit to closed testing
- [x] `.github/workflows/eas-update.yml` — manual OTA publish
- [x] GitHub secret `EXPO_TOKEN` — configured Aug 14, 2026

### GitHub secret: `EXPO_TOKEN`

Required for tag-triggered releases (`.github/workflows/release-android.yml`). Local fallback does not need this secret.

1. Sign in at [expo.dev](https://expo.dev) as `shaunakt24` (or the account that owns `@shaunak-team/gridly`).
2. **Account settings** → **Access tokens** → **Create token** (name e.g. `gridly-github-actions`; scope: enough to run EAS builds for the project).
3. GitHub → repo **gridly** → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**.
4. Name: `EXPO_TOKEN`. Value: paste the token. Save.
5. Smoke-test: push a tag (see **Release a store build** below) or run the **Release Android** workflow manually (**Actions** → **Release Android** → **Run workflow**).

### Release a store build

**Primary (CI):** bump version in `app.json` / `package.json`, commit, push, then tag:

```bash
git tag v4.3.2
git push origin v4.3.2
```

GitHub Actions runs tests, then `eas build --platform android --profile production --auto-submit` (closed testing / `alpha` track, draft release).

**Fallback (local):** same version bump committed, then:

```bash
npm run build:production:submit
```

Uses your local `eas login` session; no `EXPO_TOKEN` required.

After either path, finish rollout in Play Console (draft → review → start rollout). See **Closed testing release log** above.

Native `android/` and `ios/` folders are generated on EAS during the build (Continuous Native Generation). They are gitignored and not part of day-to-day dev (`npm run start:tunnel`, Expo Go, or a dev client).

## Phase 4 — Closed testing

- [x] Production AAB built (v4.3.1, versionCode 2)
- [x] Submitted to closed testing (`alpha`) — [submission](https://expo.dev/accounts/shaunak-team/projects/gridly/submissions/f73ed3c7-e3b2-4b90-b09d-a709c7abfe77)
- [x] Closed testing live — opt-in URL shared
- [x] v4.3.2 submitted via tag + GitHub Actions (Aug 14, 2026)
- [x] 12+ testers opted in (15 as of Aug 2026)
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
