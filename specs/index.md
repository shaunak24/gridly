# Gridly — Project Specifications

Gridly is a cross-platform mobile word puzzle inspired by Wordle. These documents are the authoritative reference for product behavior, architecture, and quality standards.

**Current release:** v1.1 (MVP + daily, stats, settings, tutorial, and polish). See [changelog.md](./changelog.md) for version history and planned work.

## Documents

| Document | Description |
|----------|-------------|
| [Branding](./branding.md) | Visual identity, logo, color system, typography |
| [Experience](./experience.md) | Screens, navigation, user flows, interaction design |
| [Game Rules](./game-rules.md) | Puzzle mechanics, scoring, validation, word lists |
| [MVP](./mvp.md) | Minimum viable product scope (complete) |
| [v1.1](./v1.1.md) | Daily mode, stats, share, settings, tutorial, persistence |
| [Architecture](./architecture.md) | System design, layers, modules, data flow |
| [Tech Stack](./tech-stack.md) | Frameworks, dependencies, dev workflow, deployment |
| [Changelog](./changelog.md) | Version history and planned features |
| [Test Plan](./test-plan.md) | Testing strategy, coverage targets, manual checks |

## Conventions

- Specs describe **current intended behavior**, not implementation history (except [changelog.md](./changelog.md)).
- When behavior changes, update the relevant spec in the same change set.
- MVP scope is frozen in [mvp.md](./mvp.md). v1.1 scope is in [v1.1.md](./v1.1.md). Future work is listed in [changelog.md](./changelog.md).
- At the start of a new work session, read this index, [changelog.md](./changelog.md), and the specs relevant to the task before coding.
- npm dependencies are limited to trusted, maintained packages listed in [tech-stack.md](./tech-stack.md).

## Quick orientation (new session)

| Area | Start here |
|------|------------|
| What the app does today | [experience.md](./experience.md), [v1.1.md](./v1.1.md) |
| What to build next | [changelog.md](./changelog.md) |
| Puzzle logic | [game-rules.md](./game-rules.md), `src/core/gameEngine.ts` |
| Code layout | [architecture.md](./architecture.md) |
| Run locally | `npm install --legacy-peer-deps`, `npm start` or `npm run start:tunnel` |
| Tests | `npm test` (30 tests) |
