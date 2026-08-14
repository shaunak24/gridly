# Gridly — Project Specifications

Gridly is a cross-platform **grid-based games** app. These documents are the authoritative reference for product behavior, architecture, and quality standards.

**Current release:** v4.3.2. See [changelog.md](./changelog.md) for version history and planned work.

## Documents

| Document | Description |
|----------|-------------|
| [Branding](./branding.md) | Visual identity, logo, color system, typography |
| [Experience](./experience.md) | Platform and game screens, navigation, flows |
| [Game Rules](./game-rules.md) | Word Hunt puzzle mechanics (legacy path; see also game modules) |
| [MVP](./mvp.md) | Minimum viable product scope (complete) |
| [v1.1](./v1.1.md) | Daily mode, stats, share, settings, tutorial, persistence |
| [v1.2](./v1.2.md) | Post-game polish, share content, daily countdown, custom puzzles |
| [v2.0](./v2.0.md) | Multi-game platform, Word Hunt migration, Grid Snap |
| [v2.1](./v2.1.md) | Grid Snap polish, game icons, difficulty settings |
| [v3.0](./v3.0.md) | Cloud accounts, cross-device sync, feedback, per-game reminders |
| [v3.0.1](./v3.0.1.md) | APK launch fix, auth error messages, sign-up confirmation UX |
| [v3.0.2](./v3.0.2.md) | Google OAuth deep link callback route for standalone APK |
| [v3.0.3](./v3.0.3.md) | Google OAuth PKCE session exchange and themed in-app messages |
| [v3.0.4](./v3.0.4.md) | Sign-out themed confirmation modal |
| [v3.1](./v3.1.md) | Clickable Word Hunt share invites (HTTPS + Supabase) |
| [v3.2](./v3.2.md) | Polish, account fixes, Android invite deep links |
| [v3.2.1](./v3.2.1.md) | Stats sync fix (per-account storage, no sign-in inflation) |
| [v3.2.2](./v3.2.2.md) | Sign-out speed and auth navigation fixes |
| [v3.2.3](./v3.2.3.md) | Back button scoping and sign-out flash fix |
| [v3.3](./v3.3.md) | Game timers and mode-segregated stats |
| [v3.3.1](./v3.3.1.md) | Stats picker contrast and sign-out persistence |
| [v4.0](./v4.0.md) | Color Flow — third grid game |
| [v4.0.1](./v4.0.1.md) | Daily reminder defaults (staggered times, 12 AM fix) |
| [v4.1](./v4.1.md) | Color Flow correctness and drag feel (locked flows, reset, haptics) |
| [v4.2](./v4.2.md) | Word Hunt invite links, branded landing, rich previews |
| [v4.3](./v4.3.md) | Daily streaks, time limits, definitions, Android back, feedback column |
| [v4.3.2](./v4.3.2.md) | Google Play pre-release quality (Android manifest) |
| [v4.3.1](./v4.3.1.md) | Word Hunt invite open from browser on Android |
| [Backlog](./backlog.md) | Planned future work (not yet assigned to a version) |
| [Architecture](./architecture.md) | System design, layers, modules, data flow |
| [Tech Stack](./tech-stack.md) | Frameworks, dependencies, dev workflow, deployment |
| [Changelog](./changelog.md) | Version history and planned features |
| [Test Plan](./test-plan.md) | Testing strategy, coverage targets, manual checks |

## Release

| Document | Description |
|----------|-------------|
| [Release index](./release/index.md) | Play Store pipeline, phase status, architecture diagram |
| [Google Play](./release/google-play.md) | Store runbook, credentials, CI/CD phases |
| [Versioning](./release/versioning.md) | Unified semver across app, tags, and Play Store |
| [Store listing (copy)](../docs/store/play-store-listing.md) | Short/full descriptions and Play Console answers |
| [Privacy policy (source)](../docs/legal/privacy-policy.md) | [Live policy](https://sites.google.com/view/shaunakstudios-gridly/home) |

## Conventions

- Specs describe **current intended behavior**, not implementation history (except [changelog.md](./changelog.md)).
- When behavior changes, update the relevant spec in the same change set.
- MVP scope is frozen in [mvp.md](./mvp.md). Shipped releases are versioned in `v*.md` files. Planned work lives in [backlog.md](./backlog.md) until promoted to a version spec.
- At the start of a new work session, read this index, [changelog.md](./changelog.md), and the specs relevant to the task before coding.
- npm dependencies are limited to trusted, maintained packages listed in [tech-stack.md](./tech-stack.md).

## Quick orientation (new session)

| Area | Start here |
|------|------------|
| What the app does today | [experience.md](./experience.md), [v3.0.md](./v3.0.md), [v3.1.md](./v3.1.md) |
| What to build next | [v3.2.md](./v3.2.md), [v3.3.md](./v3.3.md), [backlog.md](./backlog.md) |
| Word Hunt logic | [game-rules.md](./game-rules.md), `src/games/word-hunt/core/gameEngine.ts` |
| Grid Snap logic | `src/games/grid-snap/core/puzzleEngine.ts` |
| Code layout | [architecture.md](./architecture.md) |
| Run locally | `npm install --legacy-peer-deps`, `npm start` or `npm run start:tunnel` |
| Tests | `npm test` |
| Play Store release | [release/google-play.md](./release/google-play.md), [release/index.md](./release/index.md) |
