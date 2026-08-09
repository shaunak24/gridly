# Experience

## Overview

Gridly is a **multi-game platform**. The platform home shows game cards. Each game has its own hub (daily, practice, stats, how to play, settings) and play screen. App-wide theme lives on the platform home; game-specific settings live on each game hub.

## Screen map

```
Welcome (/) — sign in, Google, or continue as guest
Platform Home (/home)
  ├── Profile menu (guest or signed-in)
  ├── App Settings (theme, feedback)
  ├── Word Hunt hub (/games/word-hunt)
  │     ├── Play daily / practice / custom
  │     ├── Stats · How to play · Settings (hard mode, reminder)
  │     └── Back → Platform Home
  └── Grid Snap hub (/games/grid-snap)
        ├── Play daily / practice
        ├── Stats · How to play · Settings (difficulty, reminder)
        └── Back → Platform Home
  └── Color Flow hub (/games/color-flow)
        ├── Play daily / practice
        ├── Stats · How to play · Settings (difficulty, reminder)
        └── Back → Platform Home

Auth: /auth/sign-in · /auth/sign-up
Feedback: /feedback
Word Hunt custom puzzle ──► gridly://games/word-hunt/play?mode=custom&code=…
Legacy link gridly://game?… ──► redirects to Word Hunt play
```

## Platform home

The platform home lists game cards after welcome or sign-in.

### Layout

- **App icon** — 5×6 grid logo (see [branding.md](./branding.md)).
- **Wordmark** — “Gridly” with stylized coral “i”.
- **Tagline** — “Grid-based games.”
- **Game cards** — Color Flow, Grid Snap, Word Hunt (game icon, title, and tagline each). Order comes from `GAMES` in `gameRegistry.ts`.
- **Top bar** — profile menu (guest or signed-in); light-bulb theme toggle; gear opens **app settings**.

### Behavior

- Tapping a game card opens that game’s hub.
- Safe area insets respected on notched devices.

## Welcome

The app entry screen when the user is not signed in and has not chosen guest mode.

- **Continue with Google** — OAuth sign-in (with Google icon)
- **Sign in with email** — primary button; opens email/password sign-in
- **Create account** — secondary button (same size as sign-in); opens sign-up
- **Continue as guest** — same text size as the buttons above, grey label; skips account and opens the platform home

Signed-in users and returning guests go directly to the platform home.

While auth and welcome state load, the screen shows the GridLogo, wordmark, and a loading indicator on the themed background (not a bare spinner).

Email/password sign-in and sign-up validate input before calling the server. Auth failures and confirmations use themed in-app modals (same style as game win/loss modals), not native system alerts. Sign-up that requires email confirmation shows an informational “Check your email” message and returns the user to sign-in.

## App settings

Opened from the gear icon on the platform home.

- **Theme** — cycles Dark, Light, and System.
- **Send feedback** — opens the feedback form (general feedback or bug report).

Account actions (sign in, sign out) live in the **profile menu** on the platform home top bar. Sign-out confirmation uses the same themed in-app modal as auth messages (not a native system alert). Sign-out returns to the welcome screen immediately; cloud sync continues in the background.

Successful sign-in navigates to the platform home as the root screen. Android back from home does not return to the welcome loading state.

**Guest profile menu** uses the same auth action layout as the welcome screen: Google (when configured), **Sign in with email** and **Create an account** as full-width buttons, and **Close** as a grey label at the same text size.

## Word Hunt hub

Former v1.x home screen. Carries Word Hunt branding context.

### Layout

- **Back to Gridly** — returns to platform home.
- **Game icon** — two rows of five letter tiles showing guess feedback (mixed guess above a solved row).
- **Tagline** — “Guess the word in six tries.”
- **Streak summary** — current daily streak and daily games played (when stats exist). Grid Snap and Color Flow use a dedicated daily bucket; practice does not affect streak.
- **Play daily** / **Continue daily** — disabled when complete, with live countdown.
- **Practice** / **Continue practice**
- **Create puzzle** — custom word + share link.
- **Stats** · **How to play**
- **Settings** (gear) — hard mode, daily reminder, reminder time.

## Word Hunt settings

- **Hard mode** — revealed hints must be used in every guess.
- **Daily reminder** — optional local notification (default on at 8:00 AM).
- **Reminder time** — hour and minute picker.

## Grid Snap hub

Mirrors Word Hunt hub structure for the image jigsaw game.

### Layout

- **Back to Gridly**
- **Game icon** — photo-fragment tiles with a snapped 2×2 group and loose pieces still out of place.
- **Tagline** — “Connect the pieces.”
- **Streak summary** when stats exist.
- **Play daily** / **Continue daily** — countdown when complete.
- **Practice** / **Continue practice**
- **Stats** · **How to play**
- **Settings** (gear) — default difficulty picker (Easy 4×4, Medium 6×6, Hard 8×8); daily reminder toggle and time picker (default on at 8:30 AM); selection persists across sessions.

## Color Flow hub

Mirrors Grid Snap hub structure for the path-drawing puzzle.

### Layout

- **Back to Gridly**
- **Game icon** — mini grid with coral and teal flow paths connecting endpoint dots
- **Tagline** — "Connect the dots. Fill the grid."
- **Streak summary** when stats exist
- **Play daily** / **Continue daily** — countdown when complete
- **Practice** / **Continue practice**
- **Stats** · **How to play**
- **Settings** (gear) — default difficulty picker; daily reminder toggle and time picker (default on at 9:00 AM)

## Color Flow play

- Square grid with colored endpoint dots and orthogonal path drawing
- Status pill shows connected flows and filled cells (`Cells: 47/64`)
- Touching down picks the color: a dot starts that flow over, a drawn cell picks up that flow and trims to it, an empty cell does nothing. The color stays locked for the rest of the drag
- Dragging over another color's path cuts that path **before** the crossed cell; dragging backward erases the active tail
- A flow **locks** once it reaches its matching dot — it cannot be extended further, only backtracked
- Drawn cells carry a faint tint of their color; connected pairs' dots are marked done
- **Reset board** below the grid clears every flow on the same puzzle; the timer keeps running
- Haptics: a tick on grabbing a dot, a thump on connecting a pair, a flourish on solving
- Win when every pair is connected and every cell is filled
- In-game timer, `GameEndExperience` on solve (same pattern as Grid Snap)

## Grid Snap play

- Photo split into a square grid; every cell always holds exactly one tile.
- Tiles start shuffled across cells; the board is always fully filled.
- Visible grid lines show cell boundaries.
- Dragging a tile to another cell **swaps** the two tiles (e.g. cell 1 ↔ cell 4).
- Two tiles snap into a group only when they are **image neighbors placed in the correct relative position** (the piece to the right of another is the piece that truly sits to its right). Groups are recomputed after every move: they grow when correct neighbors line up and split again when a tile is dragged away.
- Dragging a tile in a snapped group moves the whole group when there is room; otherwise the dragged tile swaps with the target cell.
- Win when every tile is in its correct cell. The grid **remains in the same on-screen position** as during play (it does not jump to the top or leave the viewport). Tile dragging is disabled. Grid lines and tile borders disappear so the completed image appears seamless. A **GameModal** celebration (matching Word Hunt) appears after a short delay, with a **GameEndBar** below the board for Play again / Practice.

### Test mode

Setting `EXPO_PUBLIC_GRID_SNAP_TEST=1` (via `npm run start:test` or `npm run start:test:tunnel`) renders each tile as a numbered colored cell instead of an image slice and skips the image download. Tiles are numbered by their correct position (row-major, 1-based), so a solved grid reads `1, 2, 3, …` left-to-right, top-to-bottom. Use this to verify swap and snap behavior without solving a photo.

## Word Hunt — legacy sections below

## How to play

Interactive tutorial from home.

- **Speech balloon** at the top guides each step; **Next** advances read-only steps.
- Fixed example secret **CRANE**; user types **REACT**, then **BRAVE**, then **CRANE**.
- After each guess, tiles flip and the balloon explains teal (correct spot), amber (wrong spot), and slate (not in word).
- Board uses compact tiles while the keyboard is visible to avoid overlap.
- Ends with **Start practice**.

## Puzzle screen

### Layout

- **Header** — **Home** control (always visible); mode label (“Daily”, “Practice”, or “Custom”).
- **Board** — 6 rows × 5 columns of tiles with flip animation on submit.
- **Keyboard** — QWERTY on-screen keyboard below the board while playing; **hidden** after win or loss.

### Interaction

| Action | Result |
|--------|--------|
| Letter key | Fills the leftmost empty cell in the active row |
| Backspace | Removes the last letter in the active row |
| Submit (Enter) | Validates and scores the guess when the row has 5 letters |
| Invalid word | Row shakes; brief message; guess is not submitted |
| Hard mode violation | Row shakes; message; guess is not submitted |
| Correct guess | Win state; board locks; keyboard hides |
| 6 wrong guesses | Loss state; answer revealed; board locks; keyboard hides |

### End states

**Win**

- Keyboard hides immediately; prominent result and actions below the board.
- After ~1.1 seconds, a modal shows guess count with a celebration emoji; dismissible via ✕ to review the board.
- Daily modals have no action button; practice/custom modals offer **Play again**.
- Daily end bar offers **Practice**; practice/custom end bar offers **Play again**.
- **Share** copies emoji grid to clipboard (daily wins).

**Loss**

- Keyboard hides immediately; answer and actions below the board.
- After ~1.1 seconds, a modal reveals the answer with a sympathetic emoji; dismissible to review guesses.
- Daily modals have no action button; practice/custom modals offer **Play again** / **Practice**.

## Create puzzle

Screen from home for sharing a custom word challenge.

- User enters a 5-letter word (must be in the allowed guess list).
- **Share puzzle** creates a server invite and opens the system share sheet (WhatsApp, Messages, Mail, etc.) with an HTTPS link.
- **Copy link** copies the same HTTPS invite URL to the clipboard.
- The link previews in chat with the Gridly title and description, not a bare URL.
- Recipient taps the link; on Android the installed app opens and starts a custom game with that word. If a browser landing page appears, **Open in Gridly** must open the app.
- **Landing page states** — it auto-forwards to the app on arrival; if the app does not take over within ~1.6s it reveals *Don't have Gridly yet?* with the link to copy. Arriving with `?fallback=1` (Chrome bouncing back from a failed app handoff) skips the auto-forward and shows that state directly, so the page cannot loop. Inside an in-app WebView that blocks custom schemes, it shows *Open this in your browser* instead.
- Invalid or expired links show a branded **Puzzle not found** page in the browser, and the app's themed modal in-app.
- Opening a valid link with no connection says to check the connection — it does not claim the link expired.
- Custom games count toward **Custom** mode stats only (not Daily or Practice).
- Legacy `gridly://…?code=g1:…` links still open custom puzzles for recipients who saved older shares.

## Stats screen

- Games played, win rate, current streak, max streak.
- Guess distribution chart (1–6 and losses) on Word Hunt.
- **Mode picker** — Word Hunt: Daily, Practice, Custom; Grid Snap and Color Flow: Easy, Medium, Hard. Summary cards and charts reflect the selected mode. Selected mode uses a coral highlight for contrast in dark and light themes.
- **Daily challenge block** — Grid Snap and Color Flow stats show daily played, streak, and max streak above the difficulty picker.
- **Time stats** — fastest, average, and slowest solve time for the selected mode (when the player has completed at least one game in that mode).
- Data persists locally across app restarts; per-mode stats sync when signed in.

## In-game timer

- Word Hunt shows elapsed time (mm:ss) in the header timer pill.
- Grid Snap and Color Flow show a **countdown** (time remaining) while playing once the puzzle image is ready (Grid Snap); on win or loss the pill shows elapsed time up to the limit.
- The timer stops on win or loss (including time-up).
- Leaving the play screen (home or back to the game hub) **pauses** the timer; time away does not count. Continue resumes from the saved elapsed time.
- Resuming a saved in-progress game continues from stored elapsed time; if elapsed time already exceeds the limit, the game ends in a loss immediately.

## Daily completion (accounts)

- **Guest** — daily played/locked state is stored on the device for guest play.
- **Signed in** — daily played/locked state follows the account and syncs across devices.
- Switching accounts shows each account's own daily state; guest progress does not lock another user's daily.

## Notifications

- Optional **local notification** at user-selected time per game (defaults on: Word Hunt 8:00 AM, Grid Snap 8:30 AM, Color Flow 9:00 AM device local time).
- Configured on **Settings**; requests OS permission when enabled.
- Reminder text: today's puzzle is ready.
- Scheduling fails in Expo Go (SDK 53+); works in a development build.

## Navigation

| From | To | Trigger |
|------|-----|---------|
| Home | Daily puzzle | **Play daily** / **Continue daily** (Word Hunt hub) |
| Home | Practice puzzle | **Practice** (Word Hunt hub) |
| Platform home | Word Hunt | Game card |
| Platform home | Grid Snap | Game card |
| Platform home | Color Flow | Game card |
| Word Hunt hub | Play | Daily / Practice / Custom |
| Grid Snap hub | Play | Daily / Practice |
| Color Flow hub | Play | Daily / Practice |
| Deep link | Custom puzzle (invite) | `gridly://games/word-hunt/play?mode=custom&invite=…` |
| Deep link | Custom puzzle (legacy) | `gridly://games/word-hunt/play?mode=custom&code=g1:…` |
| HTTPS invite | Custom puzzle | `{SUPABASE_URL}/functions/v1/resolve-invite/{id}` → branded landing page; on Android the **Open in Gridly** button uses an `intent://` URL in the initial HTML (from User-Agent), then auto-redirect; opens `gridly://games/word-hunt/play?mode=custom&invite=…` in the APK |
| Legacy deep link | Custom puzzle | `gridly://game?…` redirects |
| Word Hunt hub | Stats | **Stats** |
| Word Hunt hub | How to play | **How to play** |
| Word Hunt hub | Settings | Gear icon |
| Platform home | App settings | Gear icon |
| Word Hunt play | Word Hunt hub | **Home** (header) |
| Grid Snap play | Grid Snap hub | **Home** (header) |
| Color Flow play | Color Flow hub | **Home** (header) |
| Game hub | Platform home | **Gridly** back button or Android hardware back |
| Android hardware back | Parent screen in app hierarchy | System back (not browser history); platform home consumes back |
| Win / Loss modal | Board | Dismiss modal (✕) |
| Board (after dismiss) | Practice | **Practice** (daily) or **Play again** (practice/custom) |
| Tutorial complete | Practice | **Start practice** |

## Accessibility (baseline)

- Minimum touch target 44×44 pt for buttons and keys.
- Sufficient contrast in both light and dark themes.
- Color feedback is paired with letter visibility.
- When a definition is available from the online dictionary, Word Hunt shows it in a **definition card** (letter tiles, part-of-speech pill, quoted text) on the end bar and win/loss modal.
