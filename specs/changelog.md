# Changelog

Version history and planned work for Gridly. Behavior specs live in the other `specs/` files; this document tracks **what shipped** and **what is next**.

---

## Shipped

### v1.2 — Current

**Status:** In progress — see [v1.2.md](./v1.2.md).

#### Player-facing

- Post-game modal shows win/loss emoji; daily modals are dismiss-only (no Practice button in modal)
- Daily end bar offers **Practice** (not “Play again”); daily cannot be restarted after completion
- Share text includes puzzle date, attempt count, and the answer word
- Home shows a live countdown on the disabled daily button when today's puzzle is complete
- **Create puzzle** — users set a 5-letter word and share via the system share sheet
- **Create puzzle** — users set a 5-letter word and copy a share link; opening the link starts a custom game

#### Engineering

- `customPuzzle` module for share-link encode/decode
- `GameMode` extended with `custom`
- Daily replay guard in `gameStore` and game screen routing

---

### v1.1

**Status:** Complete — validated on device via Expo Go (SDK 54). See [v1.1.md](./v1.1.md).

#### Player-facing

- Daily puzzle (one word per local calendar day; locks after win/loss until midnight)
- Practice mode (unlimited random words)
- In-progress daily and practice games resume after leaving the game screen or restarting the app
- Hard mode, two-sided tile flip animation, invalid-word and hard-mode rejection with row shake
- Minimal home: Play daily / Continue daily, Practice / Continue practice, Stats, How to play
- Top bar: light-bulb quick theme toggle; gear opens Settings
- Settings: hard mode, daily reminder, reminder time, theme (Dark / Light / System)
- Interactive tutorial (REACT → BRAVE → CRANE)
- Local stats: played, win %, streaks, guess distribution
- Share: copies emoji grid to clipboard after a daily win
- Dark, light, and system themes (persisted)
- Optional daily reminder at user-selected time (default 8:00 AM local)
- Post-game UX: keyboard hides on win/loss; delayed dismissible modal

#### Engineering

- Pure TS `gameEngine`, `dailyWord`, `hardMode`, `share`, `persistedGame`
- Zustand: `gameStore`, `statsStore`, `settingsStore`
- AsyncStorage persistence for stats, settings, in-progress games
- 30+ unit tests (`npm test`)
- Word lists via `npm run build:words`

---

## Backlog

Unprioritized future work — not assigned to a release version.

| Feature | Notes |
|---------|-------|
| Native share sheet | Share wins via system share (WhatsApp, Messages, Mail, etc.) in addition to clipboard |
| Haptics | Light feedback on key press; success pattern on win |
| ENABLE-1 source file | Bundle `enable1.txt` for dictionary builds without system dict |
| User accounts | Sign in (Supabase Auth or Firebase) |
| Cross-device sync | Stats and daily completion follow the account |
| Leaderboards | Optional friend or global streak comparison |
| Remote push notifications | Server-triggered reminders (beyond local daily schedule) |
| Feedback | In-app feedback form |
| Report a bug | In-app bug report flow (revisit after cloud storage) |
| Themed word sets | e.g. science week |
| Accessibility mode | High contrast, color-blind palettes |
| Localization | Multi-language support |
| Web client | Shares the same `gameEngine` |

---

## Promotion process

A backlog item moves into active scope when:

1. Behavior is specified in [experience.md](./experience.md) and/or [game-rules.md](./game-rules.md).
2. Acceptance criteria are added to a version spec (e.g. [v1.2.md](./v1.2.md)).
3. [architecture.md](./architecture.md) and [test-plan.md](./test-plan.md) are updated to match.
4. Shipped items are recorded under **Shipped** in this changelog.
