# Architecture

## Principles

- **Separation of concerns** — game logic lives in pure TypeScript; UI components only render state and dispatch actions.
- **Testability** — the game engine runs in Node/Jest without a device or simulator.
- **Incremental growth** — modules expose extension points for native share, haptics, and cloud sync without rewrites.

## Layer diagram

```
┌──────────────────────────────────────────────────────────┐
│  UI Layer (React Native + Expo Router)                   │
│  Screens · Board · Tile · Keyboard · SpeechBalloon · …   │
└─────────────────────────┬────────────────────────────────┘
                          │
┌─────────────────────────▼────────────────────────────────┐
│  State Layer (Zustand)                                   │
│  gameStore · statsStore · settingsStore                  │
└─────────────────────────┬────────────────────────────────┘
                          │
┌─────────────────────────▼────────────────────────────────┐
│  Services                                                │
│  storage · notifications                                 │
└─────────────────────────┬────────────────────────────────┘
                          │
┌─────────────────────────▼────────────────────────────────┐
│  Core Layer (pure TypeScript)                            │
│  gameEngine · dailyWord · hardMode · share · persistedGame│
│  tutorialScript · types · wordLists                      │
└─────────────────────────┬────────────────────────────────┘
                          │
┌─────────────────────────▼────────────────────────────────┐
│  Data Layer                                              │
│  words.json · allowed-guesses.json · AsyncStorage        │
└──────────────────────────────────────────────────────────┘
```

## Modules

### UI layer

| Module | Responsibility |
|--------|----------------|
| `app/index.tsx` | Home — branding, play actions, daily countdown, theme bulb, settings gear |
| `app/create-puzzle.tsx` | Custom puzzle word entry and share link |
| `app/settings.tsx` | Hard mode, reminder, reminder time, theme |
| `app/how-to-play.tsx` | Interactive tutorial |
| `app/stats.tsx` | Stats and distribution chart |
| `app/game.tsx` | Puzzle — board, keyboard, end states, delayed modal (daily/practice/custom) |
| `src/components/Board` | 6 rows of tiles; optional compact size |
| `src/components/Tile` | Single cell; two-sided flip animation |
| `src/components/Keyboard` | QWERTY layout; key coloring |
| `src/components/GameModal` | Win/loss overlays with emoji; optional primary action |
| `src/components/GameEndBar` | Post-game result and actions |
| `src/hooks/useDailyCountdown` | Live countdown hook for daily reset |
| `src/components/SpeechBalloon` | Tutorial message bubbles |
| `src/components/ReminderTimePicker` | Reminder time modal |
| `src/components/ThemeToggleButton` | Home quick theme toggle |
| `src/components/HeaderIconButton` | Header icon buttons |
| `src/components/HeaderHomeButton` | Home navigation control |

UI components read from stores and call store actions. They do not implement scoring or validation.

### State layer

| Store | Responsibility |
|-------|----------------|
| `gameStore` | Active puzzle: mode, secret word, guesses, row index, status, resume/start |
| `statsStore` | Games played, streak, distribution, daily completion date |
| `settingsStore` | Theme, hard mode, notifications, reminder time |

`gameStore` persists in-progress games via `gamePersistence.ts` on each guess. `statsStore` and `settingsStore` use `src/services/storage.ts` (AsyncStorage).

### Services

| Module | Responsibility |
|--------|----------------|
| `storage.ts` | AsyncStorage keys and load/save helpers |
| `notifications.ts` | Daily reminder scheduling; Expo Go detection |

### Core layer

| Module | Responsibility |
|--------|----------------|
| `gameEngine.ts` | `scoreGuess`, `isValidGuess`, `pickRandomWord`, `mergeLetterStates` |
| `dailyWord.ts` | `getDailyWord`, `getLocalDateKey`, puzzle number |
| `customPuzzle.ts` | Share-link encode/decode for custom puzzles |
| `hardMode.ts` | `violatesHardMode` |
| `share.ts` | `formatShareGrid` for clipboard |
| `persistedGame.ts` | Serializable in-progress game shape |
| `tutorialScript.ts` | Tutorial steps and example words |
| `wordLists.ts` | Loads bundled JSON word lists |
| `types.ts` | Shared types and constants |

`gameEngine.ts` has **no** imports from `react`, `react-native`, or `expo`.

### Data layer

| Source | Purpose |
|--------|---------|
| `words.json` | Answer words (~530) |
| `allowed-guesses.json` | Guess validation (~10,000 words) |
| AsyncStorage | Stats, settings, daily completion, saved games |

## Game flow (state machine)

```
idle → playing → won | lost
         ↑          │
         └──────────┘  play again / resume
```

| State | Transitions |
|-------|-------------|
| `idle` | `resumeOrStartGame()` → `playing` (restore saved or new game) |
| `playing` | valid guess + match → `won`; 6 guesses, no match → `lost`; valid guess, rows remain → `playing` |
| `won` / `lost` | `startGame()` → `playing`; navigate home → state persisted if still `playing` |

In-progress games save to AsyncStorage on each letter change and guess. Completed games clear saved state.

## Navigation

**Expo Router** file-based routes:

```
app/
  _layout.tsx        # Root stack, hydrates stores
  index.tsx          # Home
  game.tsx           # Puzzle
  stats.tsx          # Stats
  settings.tsx       # Settings
  how-to-play.tsx    # Interactive tutorial
```

## Extension points (planned)

| Hook | Location | Next use |
|------|----------|----------|
| `formatShareGrid()` | `src/core/share.ts` | Native share sheet (v1.2) |
| `expo-haptics` | new service | Key press and win feedback (v1.2) |
| Remote API | future layer | Account sync, leaderboards (v2) |

See [changelog.md](./changelog.md) for the full roadmap.

## Dependencies between specs

- [experience.md](./experience.md) defines what each screen does.
- [game-rules.md](./game-rules.md) defines engine behavior.
- [tech-stack.md](./tech-stack.md) defines frameworks and packages.
- [test-plan.md](./test-plan.md) defines verification.
- [changelog.md](./changelog.md) defines version history and planned features.
