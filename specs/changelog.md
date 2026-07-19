# Changelog

Version history and planned work for Gridly. Behavior specs live in the other `specs/` files; this document tracks **what shipped** and **what is next**.

---

## Shipped

### v3.0.3

**Status:** Complete — see [v3.0.3.md](./v3.0.3.md).

#### Player-facing

- **Google sign-in** — PKCE OAuth flow exchanges authorization code for a local session on standalone APK
- **In-app messages** — auth errors, sign-up validation, and feedback use themed modals instead of native Android alerts

#### Engineering

- `flowType: 'pkce'`; `parseAuthRedirectUrl`; idempotent session exchange and callback race handling
- `AppMessageHost`, `presentAppMessage`; auth/feedback alerts migrated off `Alert.alert`

---

### v3.0.2

**Status:** Complete — see [v3.0.2.md](./v3.0.2.md).

#### Player-facing

- **Google sign-in** — OAuth callback deep link (`gridly://auth/callback`) routes correctly on standalone APK; no “unmatched route” error after Google sign-in

#### Engineering

- `app/auth/callback.tsx` OAuth callback screen; idempotent `handleAuthCallback`; session check when browser dismisses on Android

---

### v3.0.1

**Status:** Complete — see [v3.0.1.md](./v3.0.1.md).

#### Player-facing

- **APK launch fix** — standalone Android build opens reliably (SDK 54 native modules aligned)
- **Auth errors** — friendly messages for invalid email, wrong password, duplicate account, and other sign-in/sign-up failures
- **Sign-up confirmation** — email-confirm flow shows “Check your email” instead of “Sign up failed”
- **Feedback** — validates optional contact email; hides raw server errors

#### Engineering

- SDK 54–compatible `expo-secure-store`, `expo-auth-session`, `expo-web-browser`; config plugins added
- `index.js` entry loads gesture handler before router; `pushIfSignedIn.ts` breaks sync circular import
- `authErrors.ts`, `authValidation.ts`, `presentAuthMessage`; defensive auth init
- Unit tests for auth errors and validation; 69 tests total

---

### v3.0

**Status:** Complete — see [v3.0.md](./v3.0.md). Follow-up device fixes shipped in [v3.0.1](./v3.0.1.md).

#### Player-facing

- **Welcome screen** — first launch offers Google sign-in, email sign-in, create account, or continue as guest
- **Profile menu** — platform home top bar shows guest or signed-in user; modal for sign in / sign out
- **Accounts** — optional Supabase auth (email/password, Google); guest play unchanged
- **Cross-device sync** — stats, game settings, and app theme sync when signed in
- **Per-game reminders** — Word Hunt and Grid Snap each have daily reminder toggle and time (default 8:00 AM)
- **Feedback** — in-app feedback and bug report form from app settings

#### Engineering

- Supabase client with secure session storage; `authStore`, `welcomeStore`, `syncService`, `mergePolicy`
- Postgres schema + RLS in `supabase/migrations/001_v3_initial.sql`
- Cloud push on settings/stats change; merge on sign-in
- `GoogleSignInButton`, `ProfileMenu`; routes `/home`, `/`, `/auth/*`, `/feedback`
- Unit tests for merge policy and reminder identifiers (`mergePolicy.test.ts`); 62 tests total

---

### v2.1

**Status:** Complete — see [v2.1.md](./v2.1.md).

#### Player-facing

- **Grid Snap post-game** — solved puzzle stays in viewport at the same position as during play; tile dragging disabled; grid lines and tile borders removed so the image appears seamless
- **Grid Snap Play again fix** — remounts puzzle canvas on new session to avoid Reanimated/gesture crash
- **Grid Snap difficulty** — dropdown picker with persistent selection; new puzzles use selected grid size (Easy 4×4, Medium 6×6, Hard 8×8); stale in-progress saves no longer force a 4×4 resume
- **Game icons** — Word Hunt (letter-tile board with feedback colors) and Grid Snap (snapped photo-fragment puzzle) on platform game cards and each game hub

#### Engineering

- `sessionPolicy.ts` — resume guard when saved puzzle difficulty/grid size differs from settings
- Unit tests for Grid Snap difficulty resume policy and settings persistence (`sessionPolicy.test.ts`, `gridSnapSettingsStore.test.ts`)

---

### v2.0

**Status:** Complete — see [v2.0.md](./v2.0.md).

#### Player-facing

- **Platform home** — Gridly hub with game cards for Word Hunt and Grid Snap
- **App settings** — theme (Dark / Light / System) on platform home; per-game settings on each game hub
- **Word Hunt** — existing daily, practice, custom puzzles, stats, and tutorial under `/games/word-hunt` (behavior unchanged)
- **Grid Snap** — new image jigsaw game with daily challenge, practice, stats, how-to-play, and settings
- Grid Snap difficulty levels: Easy 4×4, Medium 6×6, Hard 8×8
- Grid Snap is a swap puzzle: the grid is always fully filled and dragging a tile onto another cell swaps them
- Grid Snap tiles snap into a group only when they are image neighbors in the correct relative position; groups recompute each move (they split when pulled apart)
- Grid Snap win celebration uses the shared **GameEndExperience** flow (same as Word Hunt)
- Shared game-end layer: `GameEndExperience`, `useGameEndFlow`, `onGameEndPresented` in `src/shared/` (single place for modal timing, copy, and future haptics)
- Win/loss sounds on game end via `expo-audio` and bundled `assets/sounds/` tones



#### Engineering

- Multi-game code layout: `src/platform/`, `src/games/<id>/`, `src/shared/`
- Game registry (`src/platform/gameRegistry.ts`) for hub cards
- Namespaced AsyncStorage keys with migration from v1.x
- Grid Snap pure TS `puzzleEngine` with unit tests (slot-based swap, direction-aware connections, connected-component grouping)
- Grid Snap test mode (`EXPO_PUBLIC_GRID_SNAP_TEST=1`, `npm run start:test`) renders numbered tiles instead of an image for verifying drag/snap
- Legacy `gridly://game` deep links redirect to Word Hunt play

---



### v1.2

**Status:** Complete — see [v1.2.md](./v1.2.md).

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
- ENABLE-1 dictionary bundled at `src/games/word-hunt/data/sources/enable1.txt`; `npm run build:words` generates `words.json` and `allowed-guesses.json` (~8,600 five-letter words each)
- Daily word selection uses mixed hashing (`gridly-daily-v2`) so consecutive days do not pick consecutive alphabetically sorted words

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

See [backlog.md](./backlog.md) for planned future work.

---

## Promotion process

Backlog items are not tied to a version number until they are actively scoped. To promote an item from [backlog.md](./backlog.md) into development:

1. **Pick a target version** — create or open a version spec (e.g. [v2.2.md](./v2.2.md)) and move the item there with acceptance criteria.
2. **Specify behavior** — update [experience.md](./experience.md) and/or game rules specs.
3. **Update engineering docs** — [architecture.md](./architecture.md) and [test-plan.md](./test-plan.md) as needed.
4. **Remove from backlog** — delete or strike the item in [backlog.md](./backlog.md) once it is fully captured in the version spec.
5. **Ship** — when complete, record under **Shipped** in this changelog and mark the version spec complete.

Version specs are created only when work is scheduled; the backlog does not imply the next release number.

