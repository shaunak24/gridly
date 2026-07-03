# MVP

## Goal

Ship a playable Gridly puzzle on iOS and Android via Expo Go, with branded home screen, optional instructions, and a complete guess-feedback loop. No backend, no accounts, no persistence.

## Status

**MVP complete** — validated on a physical device via Expo Go (SDK 54).

## In scope

### Home

- [x] Gridly icon and wordmark
- [x] Branded layout (deep indigo background, coral accents)
- [x] **Play** — starts a new random puzzle
- [x] **How to play** — opens instruction modal/screen

### Puzzle

- [x] 6×5 tile board
- [x] On-screen QWERTY keyboard
- [x] Letter input, backspace, submit
- [x] Invalid-word rejection with visual feedback (shake + message)
- [x] Teal / amber / slate tile scoring (Wordle duplicate-letter rules)
- [x] Keyboard key colors reflect best-known letter states
- [x] Win modal with guess count
- [x] Loss modal with answer revealed
- [x] **Play again** and **Home** from end states (modal dismissible to review board; Home always in header)

### Core logic

- [x] Pure TypeScript game engine (no React Native imports)
- [x] Bundled answer and guess word lists
- [x] Unit tests for scoring edge cases

### Platform

- [x] Expo + React Native + TypeScript
- [x] Runs on physical device via Expo Go (wireless QR)
- [x] Works on iOS and Android from one codebase

### Branding

- [x] App icon and splash per [branding.md](./branding.md)
- [x] Theme colors in code (`src/theme/colors.ts`)

## Out of scope

v1.1 and later features are defined in [v1.1.md](./v1.1.md) and [changelog.md](./changelog.md). MVP explicitly excluded:

- Daily puzzle mode
- Stats, streaks, guess distribution
- Share emoji grid
- Hard mode
- Haptics and advanced animations beyond basic tile flip
- User accounts and cloud sync
- Push notifications
- Standalone App Store / Play Store builds (Expo Go is sufficient for MVP validation)

## Acceptance criteria

| # | Criterion | Met |
|---|-----------|-----|
| 1 | User opens app to branded home with icon, wordmark, Play, and How to play | Yes |
| 2 | How to play explains rules and can be dismissed without starting a game | Yes |
| 3 | Play opens a puzzle with an empty board and active keyboard | Yes |
| 4 | Valid guesses score correctly; invalid guesses are rejected | Yes |
| 5 | Duplicate-letter scoring matches [game-rules.md](./game-rules.md) examples | Yes |
| 6 | User can win in 1–6 guesses or lose on the 6th wrong guess | Yes |
| 7 | Play again starts a new random word; Home returns to branded home | Yes |
| 8 | App runs on a physical phone over Wi-Fi through Expo Go | Yes |
| 9 | Game engine tests pass in CI or local `npm test` | Yes |

## Implementation order

1. Expo scaffold, theme, assets — **done**
2. Game engine + word lists + tests — **done**
3. Home screen (branding, Play, How to play) — **done**
4. Puzzle screen (board, keyboard, game loop) — **done**
5. End states, play again, navigation polish — **done**
6. Device verification via Expo Go — **done**
