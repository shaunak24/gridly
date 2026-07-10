# Test Plan

## Strategy

Testing focuses on **game engine correctness** (pure logic) and **manual device verification** for UX flows. Component and E2E automation are deferred.

## Test layers

| Layer | Tool | Scope |
|-------|------|-------|
| Unit | Jest | `gameEngine`, `dailyWord`, `hardMode`, `share`, `customPuzzle`, `persistedGame`, `formatTime`, `dailyCountdown` |
| Component | React Native Testing Library | Deferred |
| E2E | Detox or Maestro | Deferred |
| Manual | Expo Go on device | Full acceptance |

**Current:** 38+ unit tests in 9 suites (`npm test`).

## Unit tests — game engine

File: `src/core/__tests__/gameEngine.test.ts`

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

File: `src/core/__tests__/dailyWord.test.ts`

| Case | Expected |
|------|----------|
| Same date → same word | Deterministic |
| Word ∈ answer list | Always valid |

## Unit tests — hard mode

File: `src/core/__tests__/hardMode.test.ts`

| Case | Expected |
|------|----------|
| Omits amber letter | Violation |
| Moves teal letter | Violation |
| Honors all hints | Allowed |

## Unit tests — share

File: `src/core/__tests__/share.test.ts`

| Case | Expected |
|------|----------|
| Win grid | Correct emoji rows and score line |
| Daily header | Includes puzzle number |

## Unit tests — persisted game

File: `src/core/__tests__/persistedGame.test.ts`

| Case | Expected |
|------|----------|
| Playing game serializes | Non-null snapshot |
| Won/idle | Returns null |

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
