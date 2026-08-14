# Versioning

Gridly uses a **single semver** across the repo, Play Store, and git tags. Internal spec files (`specs/v*.md`) use the same version number.

## First public Play Store release

**4.3.1** — aligns with the current product spec [v4.3.1.md](../v4.3.1.md).

## What to keep in sync

| Location | Example | When to bump |
|----------|---------|--------------|
| `app.json` → `expo.version` | `4.3.1` | Every user-visible store release |
| `package.json` → `version` | `4.3.1` | Same as `app.json` |
| `specs/vX.Y.Z.md` | `v4.3.1.md` | New spec per shipped release |
| `specs/changelog.md` | v4.3.1 entry | Each ship |
| Git tag | `v4.3.1` | Triggers production build in CI |
| Play Store `versionName` | `4.3.1` | From `expo.version` on build |
| EAS Update `runtimeVersion` | `4.3.1` | Follows `appVersion` policy |

## What stays separate

| Field | Purpose |
|-------|---------|
| `android.versionCode` | Integer required by Play Store; EAS auto-increments on each store build (`autoIncrement: true` in `eas.json`) |

## Bump rules

- **Patch** (4.3.1 → 4.3.2): bug fixes; OTA possible if `runtimeVersion` unchanged; if `appVersion` policy is used, bumping `expo.version` requires a new store binary before OTA targets that version.
- **Minor** (4.3.x → 4.4.0): new features; usually new store build.
- **Native changes** (new Expo module, `app.json` plugin, permission change): always new store build + submit.

## Git tags

Production Android releases use tags matching semver:

```
v4.3.1
v4.3.2
v4.4.0
```

CI release workflow triggers on `v[0-9]+.[0-9]+.[0-9]+`.

## Commit messages

Every commit message uses the format `vx.y.z: <description>` (strict). A `commit-msg` git hook enforces this; `npm install` configures `.githooks` via `core.hooksPath`.

```
v4.3.1: Fix Play draft submit and document closed testing roadmap.
```
