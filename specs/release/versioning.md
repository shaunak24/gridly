# Versioning

Gridly uses a **single semver** across the repo, Play Store, and git tags. Per-release scope specs live in [`specs/versions/`](../versions/index.md).

## Current release

**4.3.2** — see [v4.3.2.md](../versions/v4.3.2.md) and [changelog.md](../changelog.md).

First public Play Store release was **4.3.1** ([v4.3.1.md](../versions/v4.3.1.md)).

## What to keep in sync

| Location | Example | When to bump |
|----------|---------|--------------|
| `app.json` → `expo.version` | `4.3.2` | Every user-visible store release |
| `package.json` → `version` | `4.3.2` | Same as `app.json` |
| `specs/versions/vX.Y.Z.md` | `v4.3.2.md` | New spec per shipped release |
| `specs/changelog.md` | v4.3.2 entry | Each ship |
| Git tag | `v4.3.2` | Triggers production build in CI |
| Play Store `versionName` | `4.3.2` | From `expo.version` on build |
| EAS Update `runtimeVersion` | `4.3.2` | Follows `appVersion` policy |

## What stays separate

| Field | Purpose |
|-------|---------|
| `android.versionCode` | Integer required by Play Store; EAS auto-increments on each store build (`autoIncrement: true` in `eas.json`) |

## Bump rules

- **Patch** (4.3.1 → 4.3.2): bug fixes; OTA possible if `runtimeVersion` unchanged; if `appVersion` policy is used, bumping `expo.version` requires a new store binary before OTA targets that version.
- **Minor** (4.3.x → 4.4.0): new features; usually new store build.
- **Native changes** (new Expo module, `app.json` plugin, permission change): always new store build + submit.

## Git tags and store releases

Production Android releases use tags matching semver. Pushing a tag triggers [`.github/workflows/release-android.yml`](../../.github/workflows/release-android.yml) (EAS build + submit to closed testing).

```bash
# After version bump is committed and pushed to main:
git tag v4.3.2
git push origin v4.3.2
```

**Fallback** (no CI): `npm run build:production:submit` using local `eas login`.

After EAS submit, roll out the draft release in Play Console. Full runbook: [google-play.md](./google-play.md).

Example tags:

```
v4.3.1
v4.3.2
v4.4.0
```

## Commit messages

Every commit message uses the format `vx.y.z: <description>` (strict). A `commit-msg` git hook enforces this; `npm install` configures `.githooks` via `core.hooksPath`.

```
v4.3.2: Fix Play Console manifest issues and document EAS release workflow.
```
