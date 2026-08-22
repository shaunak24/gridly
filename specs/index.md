# Gridly — Project Specifications

Gridly is a cross-platform **grid-based games** app. These documents are the authoritative reference for product behavior, architecture, and quality standards.

**Current release:** v4.6.0 — see [changelog.md](./changelog.md) and [versions/v4.6.0.md](./versions/v4.6.0.md).

## New session checklist

1. Read this index and [changelog.md](./changelog.md).
2. Read specs relevant to the task (at minimum [experience.md](./experience.md) and [architecture.md](./architecture.md) for feature work).
3. Treat spec content as authoritative over conversation memory.

## Product and behavior

| Document | Description |
|----------|-------------|
| [Experience](./experience.md) | Platform and game screens, navigation, flows |
| [Game rules](./game-rules.md) | Word Hunt puzzle mechanics |
| [Branding](./branding.md) | Visual identity, logo, colors, typography |
| [MVP](./mvp.md) | Minimum viable product scope (frozen) |
| [Backlog](./backlog.md) | Planned work not yet assigned to a version |

## Version history

| Document | Description |
|----------|-------------|
| [Changelog](./changelog.md) | What shipped and what is next (version history) |
| [Version specs](./versions/index.md) | Per-release scope and acceptance criteria (`v*.md`) |

## Engineering

| Document | Description |
|----------|-------------|
| [Architecture](./architecture.md) | System design, layers, modules, data flow |
| [Tech stack](./tech-stack.md) | Dependencies, dev workflow, deployment, troubleshooting |
| [Test plan](./test-plan.md) | Testing strategy, coverage targets, manual checks |

## Release and deployment

| Document | Description |
|----------|-------------|
| [Release index](./release/index.md) | Play Store pipeline overview and phase status |
| [Google Play runbook](./release/google-play.md) | Store submission, credentials, CI/CD, closed testing log |
| [Versioning](./release/versioning.md) | Semver across app, tags, specs, and Play Store |
| [Store listing (copy)](../docs/store/play-store-listing.md) | Play Console listing text |
| [Privacy policy (source)](../docs/legal/privacy-policy.md) | [Live policy](https://sites.google.com/view/shaunakstudios-gridly/home) |

## Conventions

- Specs describe **current intended behavior**, not implementation history (except [changelog.md](./changelog.md)).
- When behavior changes, update the relevant spec in the same change set.
- Shipped releases get a file under [versions/](./versions/) and an entry in [changelog.md](./changelog.md).
- npm dependencies are limited to trusted packages in [tech-stack.md](./tech-stack.md).

## Quick orientation

| Area | Start here |
|------|------------|
| What the app does today | [experience.md](./experience.md), [versions/v4.3.md](./versions/v4.3.md) |
| What to build next | [backlog.md](./backlog.md), [changelog.md](./changelog.md) |
| Word Hunt logic | [game-rules.md](./game-rules.md), `src/games/word-hunt/core/` |
| Grid Snap / Color Flow | `src/games/grid-snap/`, `src/games/color-flow/` |
| Code layout | [architecture.md](./architecture.md) |
| Run locally | `npm install --legacy-peer-deps`, `npm start` or `npm run start:tunnel` |
| Background music asset | [tech-stack.md § Audio assets](./tech-stack.md#audio-assets) — `npm run build:music` |
| Tests | `npm test` |
| Ship to Play Store | [release/google-play.md](./release/google-play.md), [release/versioning.md](./release/versioning.md) |
