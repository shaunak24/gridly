# Test Plan

## Strategy

Testing focuses on **game engine correctness** (pure logic) and **manual device verification** for UX flows. Component and E2E automation are deferred.

## Test layers

| Layer | Tool | Scope |
|-------|------|-------|
| Unit | Jest | Word Hunt + Grid Snap core modules, utilities |
| Component | React Native Testing Library | Deferred |
| E2E | Detox or Maestro | Deferred |
| Manual | Expo Go on device | Full acceptance |

**Current:** 55+ unit tests in 12 suites (`npm test`).

## Unit tests — game engine

File: `src/games/word-hunt/core/__tests__/gameEngine.test.ts`

### `scoreGuess(secret, guess)`

| Case | Secret | Guess | Expected |
|------|--------|-------|----------|
| All correct | `CRANE` | `CRANE` | All teal |
| All absent | `CRANE` | `SLUMP` | All slate |
| Mixed | `CRANE` | `SLATE` | S slate, L slate, A teal, T slate, E teal |
| Tutorial mix | `CRANE` | `REACT` | R/E/C present, A teal, T slate |
| Duplicate — secret dup | `APPLE` | `PAPER` | Per game-rules |
| Duplicate — guess dup | `ABBEY` | `LLAMA` | Per game-rules |

### `isValidGuess(guess, dictionary)`

| Case | Input | Expected |
|------|-------|----------|
| Valid word | Known 5-letter entry | `true` |
| Too short | `CAT` | `false` |
| Not in list | `ZZZZZ` | `false` |

## Unit tests — daily word

File: `src/games/word-hunt/core/__tests__/dailyWord.test.ts`

| Case | Expected |
|------|----------|
| Same date → same word | Deterministic |
| Word ∈ answer list | Always valid |

## Unit tests — hard mode

File: `src/games/word-hunt/core/__tests__/hardMode.test.ts`

| Case | Expected |
|------|----------|
| Omits amber letter | Violation |
| Moves teal letter | Violation |
| Honors all hints | Allowed |

## Unit tests — share

File: `src/games/word-hunt/core/__tests__/share.test.ts`

| Case | Expected |
|------|----------|
| Win grid | Correct emoji rows and score line |
| Daily header | Includes puzzle number |

## Unit tests — persisted game

File: `src/games/word-hunt/core/__tests__/persistedGame.test.ts`

| Case | Expected |
|------|----------|
| Playing game serializes | Non-null snapshot |
| Won/idle | Returns null |

## Unit tests — Grid Snap puzzle engine

File: `src/games/grid-snap/core/__tests__/puzzleEngine.test.ts`

| Case | Expected |
|------|----------|
| `createPuzzle` by difficulty | Easy 16 tiles, Medium 36, Hard 64 |
| Swap / snap / solve | Per game rules |

## Unit tests — Grid Snap session policy

File: `src/games/grid-snap/core/__tests__/sessionPolicy.test.ts`

| Case | Expected |
|------|----------|
| Saved difficulty matches settings | Resume allowed |
| Saved easy 4×4, settings medium | Do not resume (start fresh at 6×6) |
| Saved cols mismatch selected difficulty | Do not resume |
| Prior-day daily save | Do not resume |

## Unit tests — Grid Snap settings store

File: `src/games/grid-snap/stores/__tests__/gridSnapSettingsStore.test.ts`

| Case | Expected |
|------|----------|
| `ensureHydrated` | Loads persisted difficulty before new game |
| `setDifficulty` | Saves choice and clears in-progress daily/practice snapshots |

## Manual test checklist — v2.0

### Platform

- [ ] Platform home shows Word Hunt and Grid Snap cards with game icons
- [ ] Theme toggle and app settings work from platform home
- [ ] Each game hub back button returns to platform home

### Word Hunt

- [ ] Daily, practice, create puzzle, stats, how to play work from game hub
- [ ] In-game Home returns to Word Hunt hub (not platform home)
- [ ] Legacy `gridly://game?mode=custom&code=…` opens custom puzzle

### Grid Snap

- [ ] Daily and practice load an image puzzle at the selected difficulty (16 / 36 / 64 tiles in test mode)
- [ ] Dragging tiles works; matching neighbors group correctly; win modal appears on solve
- [ ] Completing puzzle shows win state; grid stays in viewport, tiles are not draggable, and image appears without grid lines
- [ ] Stats and settings persist

### v3.0 — cloud and accounts

Requires Supabase env vars and `npm run build:apk` for OAuth and reminders.

- [ ] Guest can play without signing in
- [ ] App settings: account section, theme, send feedback
- [ ] Sign in / sign up with email; Google OAuth in dev build
- [ ] Sign out restores local data
- [ ] Stats sync across devices when signed in
- [ ] Word Hunt and Grid Snap each have daily reminder toggle and time
- [ ] Feedback form submits to Supabase

## Manual test checklist — v1.1

Run on at least one physical device via Expo Go.

### Home

- [ ] Icon and wordmark visible
- [ ] Play daily / Continue daily behaves correctly
- [ ] Practice / Continue practice behaves correctly
- [ ] Light-bulb toggles theme; gear opens Settings
- [ ] Stats and How to play links work

### Settings

- [ ] Hard mode toggle persists
- [ ] Daily reminder toggle and time picker work (or alert in Expo Go)
- [ ] Theme cycle persists

### How to play (tutorial)

- [ ] Speech balloons advance with Next
- [ ] User types REACT, BRAVE, CRANE as prompted
- [ ] First guess shows teal, amber, and slate
- [ ] Keyboard does not overlap board
- [ ] Start practice launches game

### Puzzle

- [ ] Keys fill row; backspace works; submit validates
- [ ] Invalid word shakes; hard mode violations shake
- [ ] Teal / amber / slate scoring correct
- [ ] In-progress game resumes after Home and app restart
- [ ] Daily locks after completion until next day

### End game

- [ ] Keyboard hides on win/loss
- [ ] Result and Play again visible below board
- [ ] Modal appears ~2 seconds after final guess
- [ ] Dismiss modal (✕) reviews board
- [ ] Share copies to clipboard on win

### Regression

After changes to `gameEngine.ts` or word lists:

1. Run `npm test`.
2. Play one win and one loss on device.

## Coverage targets

| Module | Target |
|--------|--------|
| `gameEngine.ts` | High branch coverage |
| `dailyWord.ts`, `hardMode.ts`, `share.ts` | Key paths covered |
| UI components | Manual only |

## CI (recommended)

```bash
npm test
```

Run tests on every pull request.

## Known non-goals

- No automated screenshot/visual regression
- No load or performance benchmarks
- No backend API tests (no backend yet)
