# Gridly

Gridly is a cross-platform **grid-based games** app. The platform home lists games; **Word Hunt** is a five-letter word puzzle (Wordle-style), and **Grid Snap** is an image jigsaw where you drag and connect tiles.

Built with **Expo SDK 54**, **React Native**, and **TypeScript**. Runs on iOS and Android from one codebase.

## Features

### Platform

- **Game hub** — Word Hunt and Grid Snap cards
- **App settings** — dark, light, or system theme on the platform home

### Word Hunt

- **Daily puzzle** — one shared word per day (local timezone)
- **Practice** — unlimited random words
- **Custom puzzles** — share a word via deep link
- **Resume** — in-progress games survive leaving the app
- **Stats**, **hard mode**, **tutorial**, **daily reminder**

### Grid Snap

- **Daily challenge** and **practice** image puzzles
- **Drag and snap** — matching neighbors connect with animation
- **Difficulty** — Easy 4×4, Medium 6×6, Hard 8×8
- **Stats** and **how to play**

## Tech stack

| Layer | Tools |
|-------|--------|
| App | Expo 54, React Native 0.81, Expo Router |
| State | Zustand (per game + app) |
| Storage | AsyncStorage (namespaced) |
| Animation | Reanimated 4, Gesture Handler |
| Tests | Jest (45 unit tests) |

Game logic lives in pure TypeScript under `src/games/<id>/core/` with no React Native imports.

## Prerequisites

- **Node.js 20+**
- **npm**
- **[Expo Go](https://expo.dev/go)** on your phone (SDK 54) for day-to-day development
- Free **[expo.dev](https://expo.dev)** account for cloud APK builds

No Android Studio or Xcode is required for Expo Go development.

## Getting started

```bash
git clone <repo-url>
cd gridly
npm install --legacy-peer-deps
npm start
```

Scan the QR code with Expo Go (Android) or the Camera app (iOS).

### Corporate / restricted network

This project uses `registry.npmjs.org` via `.npmrc`. **Do not** `npm install -g` packages from this machine — global npm may point at a corporate registry.

If install fails on cache permissions:

```bash
npm install --legacy-peer-deps --cache /tmp/npm-cache-gridly
```

If the phone cannot reach your laptop on LAN:

```bash
npm run start:tunnel
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start Metro (LAN) |
| `npm run start:tunnel` | Start Metro via tunnel (firewalled networks) |
| `npm test` | Run unit tests |
| `npm run build:words` | Regenerate word lists from dictionary source |
| `npm run eas login` | Log in to Expo (local CLI) |
| `npm run build:apk` | Cloud-build an Android APK (EAS) |

`npm run android` and `npm run ios` require a local Android SDK or Xcode — not needed if you use Expo Go or EAS.

## Install on your phone (APK)

Build in the cloud with **EAS** — no Android Studio:

```bash
cd gridly
npm run eas login          # first time
npm run build:apk          # ~10–20 min; download link when done
```

Open the build URL on your phone, download the `.apk`, and install. This standalone app supports daily reminders (unlike Expo Go).

Project ID is configured in `app.json` under `extra.eas.projectId`.

## Word lists

- **Answers:** `src/data/words.json` (~8,600 five-letter ENABLE-1 words)
- **Allowed guesses:** `src/data/allowed-guesses.json` (~8,600 words, ENABLE-1)

Regenerate from source:

```bash
npm run build:words
```

See [src/data/dictionary.md](src/data/dictionary.md) for sources.

## Project structure

```
app/                  # Expo Router screens (home, game, stats, settings, tutorial)
src/
  components/         # Board, Tile, Keyboard, UI
  core/               # gameEngine, dailyWord, hardMode, share (pure TS)
  stores/             # gameStore, statsStore, settingsStore
  services/           # storage, notifications
  theme/              # colors, useTheme
  data/               # word lists
specs/                # Product & technical specifications (source of truth)
scripts/              # build-word-lists.mjs
```

## Specifications

Behavior, architecture, and roadmap are documented in [`specs/`](specs/):

| Doc | Purpose |
|-----|---------|
| [specs/index.md](specs/index.md) | Index and new-session orientation |
| [specs/experience.md](specs/experience.md) | Screens and UX |
| [specs/game-rules.md](specs/game-rules.md) | Scoring and word lists |
| [specs/v1.2.md](specs/v1.2.md) | Current release scope |
| [specs/changelog.md](specs/changelog.md) | Version history and planned work |
| [specs/tech-stack.md](specs/tech-stack.md) | Dependencies and troubleshooting |

## Testing

```bash
npm test
```

Covers `gameEngine`, `dailyWord`, `hardMode`, `share`, and persistence helpers. See [specs/test-plan.md](specs/test-plan.md) for manual device checks.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Expo Go “failed to download” | `npm run start:tunnel` |
| SDK mismatch | Match Expo Go to SDK 54 (`expo@~54`) |
| Invalid words rejected | Run `npm run build:words` |
| Notifications don’t work | Expected in Expo Go; use APK from EAS |
| `npm install -g` fails | Use local deps only; run `npm run eas` from this folder |
| `npm run android` / `adb ENOENT` | No local Android SDK — use Expo Go or `npm run build:apk` |

## License

Private project.
