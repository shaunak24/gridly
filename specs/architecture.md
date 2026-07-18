# Architecture

## Principles

- **Separation of concerns** — game logic lives in pure TypeScript per game; UI components only render state and dispatch actions.
- **Testability** — game engines run in Node/Jest without a device or simulator.
- **Incremental growth** — `gameRegistry` and per-game modules make adding games straightforward.

## Layer diagram

```
┌──────────────────────────────────────────────────────────┐
│  UI Layer (React Native + Expo Router)                   │
│  Platform home · Game hubs · Play screens · Components   │
└─────────────────────────┬────────────────────────────────┘
                          │
┌─────────────────────────▼────────────────────────────────┐
│  Platform Layer                                          │
│  gameRegistry · GameCard                                 │
└─────────────────────────┬────────────────────────────────┘
                          │
┌─────────────────────────▼────────────────────────────────┐
│  State Layer (Zustand, per game + app)                   │
│  appSettingsStore · word-hunt stores · grid-snap stores  │
└─────────────────────────┬────────────────────────────────┘
                          │
┌─────────────────────────▼────────────────────────────────┐
│  Services (shared + per game)                            │
│  storage · notifications · imageService · shareSheet     │
└─────────────────────────┬────────────────────────────────┘
                          │
┌─────────────────────────▼────────────────────────────────┐
│  Core Layer (pure TypeScript, per game)                  │
│  word-hunt: gameEngine, dailyWord, share, …              │
│  grid-snap: puzzleEngine, dailyPuzzle, …                 │
└─────────────────────────┬────────────────────────────────┘
                          │
┌─────────────────────────▼────────────────────────────────┐
│  Data Layer                                              │
│  word lists JSON · AsyncStorage (namespaced keys)        │
└──────────────────────────────────────────────────────────┘
```

## Directory layout

```
app/
  index.tsx                 # Platform home
  settings.tsx              # App theme
  game.tsx                  # Legacy deep-link redirect
  games/
    word-hunt/              # Hub, play, stats, settings, …
    grid-snap/

src/
  platform/                 # gameRegistry, GameCard
  shared/                   # theme, app settings, storage, header components
  games/
    word-hunt/              # core, components, stores, data, hooks
    grid-snap/              # core, components, stores, services
  services/                 # notifications, shareSheet (shared infra)
```

## Modules

### Platform

| Module | Responsibility |
|--------|----------------|
| `app/index.tsx` | Platform home — game cards, theme toggle, app settings link |
| `app/settings.tsx` | App-level theme (Dark / Light / System) |
| `src/platform/gameRegistry.ts` | Registered games for hub cards |
| `src/platform/components/GameCard.tsx` | Game card UI |

### Word Hunt

| Module | Responsibility |
|--------|----------------|
| `app/games/word-hunt/index.tsx` | Game hub — daily, practice, create, stats links |
| `app/games/word-hunt/play.tsx` | Board, keyboard, end states |
| `src/games/word-hunt/core/gameEngine.ts` | Scoring, validation |
| `src/games/word-hunt/stores/gameStore.ts` | Active puzzle state |
| `src/games/word-hunt/stores/statsStore.ts` | Stats and daily completion |
| `src/games/word-hunt/stores/wordHuntSettingsStore.ts` | Hard mode, reminders |

### Grid Snap

| Module | Responsibility |
|--------|----------------|
| `app/games/grid-snap/index.tsx` | Game hub |
| `app/games/grid-snap/play.tsx` | Puzzle canvas, drag/snap |
| `src/games/grid-snap/core/puzzleEngine.ts` | Grid split, adjacency, groups, win |
| `src/games/grid-snap/stores/gridSnapStore.ts` | Puzzle session state |
| `src/games/grid-snap/services/imageService.ts` | Picsum / optional Pexels images |

### Shared

| Module | Responsibility |
|--------|----------------|
| `src/shared/stores/appSettingsStore.ts` | App theme preference |
| `src/shared/services/storage.ts` | AsyncStorage + v1.x key migration |
| `src/shared/theme/` | Colors, `useTheme` |
| `src/shared/components/GameModal.tsx` | Win/loss celebration modal (all games) |
| `src/shared/components/GameEndBar.tsx` | Post-game action bar (all games) |
| `src/shared/components/GameEndExperience.tsx` | Composes end bar + modals for play screens |
| `src/shared/hooks/useGameEndFlow.ts` | Delayed modal timing, daily vs practice actions |
| `src/shared/gameEnd/gameEndConfig.ts` | Shared copy, delay constant, `onGameEndPresented` hook for haptics |
| `src/shared/services/gameEndSound.ts` | Win/loss sound playback via `expo-audio` |

## Navigation

**Expo Router** file-based routes. See [experience.md](./experience.md).

## Extension points

| Hook | Location | Next use |
|------|----------|----------|
| `GAMES` registry | `src/platform/gameRegistry.ts` | Add third game |
| `formatShareGrid()` | `src/games/word-hunt/core/share.ts` | Native share (backlog) |
| `expo-haptics` | `onGameEndPresented` in `src/shared/gameEnd/gameEndConfig.ts` | Win/loss haptics (backlog) |

See [backlog.md](./backlog.md) for planned work.

## Dependencies between specs

- [experience.md](./experience.md) defines what each screen does.
- [game-rules.md](./game-rules.md) defines Word Hunt engine behavior.
- [tech-stack.md](./tech-stack.md) defines frameworks and packages.
- [test-plan.md](./test-plan.md) defines verification.
- [changelog.md](./changelog.md) defines version history.
