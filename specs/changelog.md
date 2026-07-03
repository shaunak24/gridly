# Changelog

Version history and planned work for Gridly. Behavior specs live in the other `specs/` files; this document tracks **what shipped** and **what is next**.

## v1.1 — Current (shipped)

**Status:** Complete — validated on device via Expo Go (SDK 54). Behavior is specified in [v1.1.md](./v1.1.md).

### Core gameplay

- Daily puzzle (one word per local calendar day; locks after win/loss until midnight)
- Practice mode (unlimited random words)
- In-progress daily and practice games **resume** after leaving the game screen or restarting the app
- Hard mode (revealed hints must be used in every guess)
- Two-sided tile flip animation on submit
- Invalid-word and hard-mode rejection with row shake

### Home and navigation

- Minimal home: Play daily / Continue daily, Practice / Continue practice, Stats, How to play
- Top bar: light-bulb quick theme toggle (dark ↔ light); gear opens **Settings**
- Settings screen: hard mode, daily reminder, reminder time, theme (Dark / Light / System)

### How to play

- Interactive tutorial with speech-balloon steps
- Guided example: **REACT → BRAVE → CRANE** (teal, amber, and slate explained)
- Real board and keyboard; compact layout while typing

### Stats and share

- Local stats: played, win %, streaks, guess distribution
- **Share:** copies emoji grid to clipboard after a win (puzzle number + score; no answer spoiler)
- Stats screen from home

### Theme and notifications

- Dark, light, and system themes (persisted)
- Optional daily reminder at user-selected time (default 8:00 AM local)
- Local notifications require a **development build**; Expo Go shows an alert if scheduling fails

### Post-game UX

- Keyboard hides on win/loss; result and actions use the freed space
- Win/loss modal appears after ~2 seconds (tile flips finish first)
- Dismissible modal; no redundant “close to review” copy

### Engineering

- Pure TS `gameEngine`, `dailyWord`, `hardMode`, `share`, `persistedGame`
- Zustand: `gameStore`, `statsStore`, `settingsStore`
- AsyncStorage persistence for stats, settings, in-progress games
- 30 unit tests (`npm test`)
- Word lists via `npm run build:words` (ENABLE-1 / system dict)

---

## v1.2 — Polish (planned)

| Feature | Description |
|---------|-------------|
| **Native share sheet** | Share wins via system share (WhatsApp, Messages, Mail, etc.) in addition to clipboard copy |
| **Haptics** | Light feedback on key press; success pattern on win |
| **ENABLE-1 source file** | Bundle `enable1.txt` for dictionary builds without system dict |

Share today: `expo-clipboard` only. v1.2 adds `expo-sharing` or React Native `Share` API so users can pick any installed app.

---

## v2 — Cloud and social (planned)

| Feature | Description |
|---------|-------------|
| **User accounts** | Sign in (Supabase Auth or Firebase) |
| **Cross-device sync** | Stats and daily completion follow the account |
| **Leaderboards** | Optional friend or global streak comparison |
| **Remote push notifications** | Server-triggered reminders (beyond local daily schedule) |

Backend choice (Supabase vs Firebase) is TBD at v2 planning time.

---

## v3 — Exploration (ideas)

- Themed word sets (e.g. science week)
- Accessibility mode (high contrast, color-blind palettes)
- Localization
- Web client sharing the same `gameEngine`

---

## Promotion process

A planned feature moves into active scope when:

1. Behavior is specified in [experience.md](./experience.md) and/or [game-rules.md](./game-rules.md).
2. Acceptance criteria are added to [v1.1.md](./v1.1.md) or a new version section.
3. [architecture.md](./architecture.md) and [test-plan.md](./test-plan.md) are updated to match.
4. Shipped items are recorded in this changelog.
