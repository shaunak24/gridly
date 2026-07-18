# Gridly — Project Specifications

Gridly is a cross-platform **grid-based games** app. These documents are the authoritative reference for product behavior, architecture, and quality standards.

**Current release:** v2.1 (Grid Snap polish and platform improvements). See [changelog.md](./changelog.md) for version history and planned work.

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
| [v2.2](./v2.2.md) | Planned backlog |
| [Architecture](./architecture.md) | System design, layers, modules, data flow |
| [Tech Stack](./tech-stack.md) | Frameworks, dependencies, dev workflow, deployment |
| [Changelog](./changelog.md) | Version history and planned features |
| [Test Plan](./test-plan.md) | Testing strategy, coverage targets, manual checks |

## Conventions

- Specs describe **current intended behavior**, not implementation history (except [changelog.md](./changelog.md)).
- When behavior changes, update the relevant spec in the same change set.
- MVP scope is frozen in [mvp.md](./mvp.md). v2.1 is complete — see [v2.1.md](./v2.1.md). Active backlog is in [v2.2.md](./v2.2.md).
- At the start of a new work session, read this index, [changelog.md](./changelog.md), and the specs relevant to the task before coding.
- npm dependencies are limited to trusted, maintained packages listed in [tech-stack.md](./tech-stack.md).

## Quick orientation (new session)

| Area | Start here |
|------|------------|
| What the app does today | [experience.md](./experience.md), [v2.1.md](./v2.1.md) |
| What to build next | [v2.2.md](./v2.2.md) |
| Word Hunt logic | [game-rules.md](./game-rules.md), `src/games/word-hunt/core/gameEngine.ts` |
| Grid Snap logic | `src/games/grid-snap/core/puzzleEngine.ts` |
| Code layout | [architecture.md](./architecture.md) |
| Run locally | `npm install --legacy-peer-deps`, `npm start` or `npm run start:tunnel` |
| Tests | `npm test` |
