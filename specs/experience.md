# Experience

## Overview

Gridly presents a branded home screen, an interactive how-to-play tutorial, daily and practice modes, stats, settings, and a focused puzzle screen. Navigation is shallow: users reach the puzzle in one or two taps from home.

## Screen map

```
Home ──► How to Play (interactive tutorial)
  ├──► Daily puzzle
  ├──► Practice puzzle
  ├──► Create puzzle (custom word + share link)
  ├──► Stats
  └──► Settings

Puzzle ──► Win / Loss (delayed modal → review board)
Custom puzzle ──► opened via gridly:// deep link
```

## Home screen

The home screen is the app entry point and carries full Gridly branding.

### Layout

- **App icon** — 5×6 grid logo (see [branding.md](./branding.md)).
- **Wordmark** — “Gridly” with stylized coral “i”.
- **Tagline** — short line such as “Guess the word in six tries.”
- **Streak summary** — current streak and games played (when stats exist).
- **Play daily** / **Continue daily** — today's puzzle; disabled when complete, with a live countdown on the button (`MM:SS` or `H:MM:SS`).
- **Practice** / **Continue practice** — random unlimited puzzle.
- **Create puzzle** — set a 5-letter word and copy a share link for friends.
- **Stats** — opens the stats screen.
- **How to play** — opens the interactive tutorial.
- **Top bar** — light-bulb icon toggles dark/light theme; gear icon opens **Settings**.

### Behavior

- Safe area insets respected on notched devices.
- Theme quick-toggle on home switches between dark and light; Settings offers Dark / Light / System.

## Settings

Dedicated screen opened from the gear icon on home.

- **Hard mode** — revealed hints must be used in every guess.
- **Daily reminder** — optional local notification at a user-selected time (default 8:00 AM).
- **Reminder time** — hour and minute picker (5-minute steps); enabled when reminder is on.
- **Theme** — cycles Dark, Light, and System.

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
- After ~2 seconds, a modal shows guess count with a celebration emoji; dismissible via ✕ to review the board.
- Daily modals have no action button; practice/custom modals offer **Play again**.
- Daily end bar offers **Practice**; practice/custom end bar offers **Play again**.
- **Share** copies emoji grid to clipboard (daily wins).

**Loss**

- Keyboard hides immediately; answer and actions below the board.
- After ~2 seconds, a modal reveals the answer with a sympathetic emoji; dismissible to review guesses.
- Daily modals have no action button; practice/custom modals offer **Play again** / **Practice**.

## Create puzzle

Screen from home for sharing a custom word challenge.

- User enters a 5-letter word (must be in the allowed guess list).
- **Share puzzle** opens the system share sheet (WhatsApp, Messages, Mail, etc.) with a message and deep link.
- Recipient opens the link; the app starts a custom game with that word.
- Custom games do not count toward stats or daily completion.

## Stats screen

- Games played, win rate, current streak, max streak.
- Guess distribution chart (1–6 and losses).
- Data persists locally across app restarts.

## Notifications

- Optional **local notification** at user-selected time (default 8:00 AM device local time).
- Configured on **Settings**; requests OS permission when enabled.
- Reminder text: today's puzzle is ready.
- Scheduling fails in Expo Go (SDK 53+); works in a development build.

## Navigation

| From | To | Trigger |
|------|-----|---------|
| Home | Daily puzzle | **Play daily** / **Continue daily** |
| Home | Practice puzzle | **Practice** / **Continue practice** |
| Home | Create puzzle | **Create puzzle** |
| Deep link | Custom puzzle | `gridly://game?mode=custom&code=…` |
| Home | Stats | **Stats** |
| Home | How to play | **How to play** |
| Home | Settings | Gear icon |
| Settings | Home | **Home** (header) |
| Puzzle | Home | **Home** (header) |
| Win / Loss modal | Board | Dismiss modal (✕) |
| Board (after dismiss) | Practice | **Practice** (daily) or **Play again** (practice/custom) |
| Tutorial complete | Practice | **Start practice** |

## Accessibility (baseline)

- Minimum touch target 44×44 pt for buttons and keys.
- Sufficient contrast in both light and dark themes.
- Color feedback is paired with letter visibility.
