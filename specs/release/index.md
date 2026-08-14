# Release and deployment

Authoritative docs for shipping Gridly to app stores and maintaining releases. Product behavior specs live in the parent [specs/](../index.md) tree; per-version scopes in [versions/](../versions/index.md).

**Current Play Store effort:** v4.3.2 on closed testing (`alpha`), package `com.gridlygames.app`.

## Documents

| Document | Description |
|----------|-------------|
| [google-play.md](./google-play.md) | Play Store runbook, phase checklist, credentials, closed testing log |
| [versioning.md](./versioning.md) | Unified semver across app, specs, tags, and Play Store |
| [../../docs/store/play-store-listing.md](../../docs/store/play-store-listing.md) | Copy-paste store listing text and Play Console answers |
| [../../docs/legal/privacy-policy.md](../../docs/legal/privacy-policy.md) | Privacy policy source |
| [../../docs/legal/delete-account.md](../../docs/legal/delete-account.md) | Delete-account page source for Play Console |

## Published URLs

| Asset | URL |
|-------|-----|
| Privacy policy (live) | https://sites.google.com/view/shaunakstudios-gridly/home |
| Delete account (live) | https://sites.google.com/view/shaunakstudios-gridly/delete-account |
| Play Store listing | Complete in Console (Aug 2026); public page after first release |

## Release pipeline

```mermaid
flowchart TD
  subgraph dev [Development]
    PR[Pull request] --> GHA_Test[GitHub Actions: npm test]
    Merge[Merge to main] --> GHA_Test2[GitHub Actions: npm test]
  end

  subgraph ota [Fast updates - no store review]
    GHA_Test2 --> EAS_Update[EAS Update publish]
    EAS_Update --> UsersOTA[Installed production builds]
  end

  subgraph store [Store releases - native changes]
    Tag["Git tag v4.3.x or manual dispatch"] --> EAS_Build[EAS Build production AAB]
    EAS_Build --> EAS_Submit[EAS Submit to Play track]
    EAS_Submit --> PlayConsole[Google Play Console]
    PlayConsole --> UsersStore[New installs + upgrades]
  end
```

## Phase status (Play Store)

| Phase | Status | Notes |
|-------|--------|-------|
| 0 — Play Console prep | **Complete** | Store listing live |
| 1 — EAS credentials | **Complete** | Service account + production env vars |
| 2 — Repo config | **Complete** | v4.3.2, `eas.json`, `expo-updates`, manifest plugins |
| 3 — CI/CD | **Complete** | Workflows + `EXPO_TOKEN` in GitHub Actions |
| 4 — Closed testing | **In progress** | v4.3.1 live; v4.3.2 submitted; 15+ testers opted in |
| 4b — Production access | **Blocked** | Requires 12 testers × 14 consecutive days |
| 5 — Steady state | Not started | OTA + tagged store releases |

**Current milestone:** v4.3.2 rollout on closed testing → continue 14-day window → apply for production access.

## Quick commands

```bash
npm run build:production          # EAS production AAB (no submit)
npm run build:production:submit   # build + submit to Play (local fallback)
npm run update:production         # EAS Update OTA (JS-only changes)
npm run supabase:deploy-invites   # redeploy after deepLink package changes
```

Tag-triggered CI (primary): see [google-play.md — Release a store build](./google-play.md#release-a-store-build).
