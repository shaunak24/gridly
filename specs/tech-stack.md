# Tech Stack

## Platform

| Choice | Version target | Rationale |
|--------|----------------|-----------|
| **Expo** | SDK 54 | Single codebase for iOS and Android; minimal native setup |
| **React Native** | 0.81 (bundled with Expo 54) | Mobile UI runtime |
| **TypeScript** | 5.9 | Type safety |
| **Expo Router** | ~6 | File-based navigation |

## Dependency policy

Gridly runs on a work laptop. All npm packages must come from **trusted, maintained sources** on the public registry (`registry.npmjs.org`).

| Rule | Detail |
|------|--------|
| Official first | Use Expo and React Native packages before third-party alternatives |
| Approved additions only | New packages require a clear need and must be widely used with an active maintainer |
| No untrusted sources | No git URL installs, CDN scripts, or obscure scoped packages |
| Version pinning | Caret ranges on known-good versions in `package.json` |
| Minimal surface | Prefer local code over a new dependency when effort is comparable |

Corporate npm mirrors may block some packages; installs use `npm install --legacy-peer-deps` against the public registry when required.

## Approved dependencies

### Core

| Package | Publisher | Purpose |
|---------|-----------|---------|
| `expo` | Expo | App runtime and tooling |
| `expo-asset` | Expo | Asset bundling |
| `expo-constants` | Expo | Execution environment (Expo Go detection) |
| `expo-font` | Expo | Font loading |
| `expo-linking` | Expo | Deep links |
| `expo-router` | Expo | File-based navigation |
| `expo-status-bar` | Expo | Status bar styling |
| `react` | Meta | UI library |
| `react-native` | Meta | Mobile runtime |
| `react-native-safe-area-context` | Expo ecosystem | Safe area insets |
| `react-native-screens` | Expo ecosystem | Native screen containers |
| `react-native-web` | Meta / Expo | Web target for dev server |
| `react-dom` | Meta | Web target peer |
| `zustand` | pmndrs | Game, stats, and settings state |

### v1.1 features

| Package | Publisher | Purpose |
|---------|-----------|---------|
| `@react-native-async-storage/async-storage` | React Native Community | Stats, settings, saved games |
| `expo-clipboard` | Expo | Copy share grid to clipboard |
| React Native `Share` | Meta | System share sheet for custom puzzles |
| `expo-notifications` | Expo | Local daily reminder |

### Animation

| Package | Publisher | Purpose |
|---------|-----------|---------|
| `react-native-reanimated` | Software Mansion | Tile flip and shake |
| `react-native-worklets` | Software Mansion | Reanimated 4 peer (SDK 54) |
| `react-native-gesture-handler` | Software Mansion | Gesture support |

### v3.0 cloud and auth

| Package | Publisher | Purpose |
|---------|-----------|---------|
| `@supabase/supabase-js` | Supabase | Auth and Postgres client |
| `react-native-url-polyfill` | Community | URL parsing for Supabase in RN |
| `expo-secure-store` | Expo | Encrypted auth session storage |
| `expo-web-browser` | Expo | OAuth browser session |
| `expo-auth-session` | Expo | OAuth redirect handling |

### Feedback

| Package | Publisher | Purpose |
|---------|-----------|---------|
| `expo-audio` | Expo | Win/loss sounds and ambient background music |

### Dev and test

| Package | Publisher | Purpose |
|---------|-----------|---------|
| `typescript` | Microsoft | Type checking |
| `jest` | Meta | Unit tests |
| `jest-expo` | Expo | Expo Jest preset |
| `babel-preset-expo` | Expo | Babel preset |
| `@types/jest` | DefinitelyTyped | Jest types |
| `@expo/ngrok` | Expo | Tunnel mode (`npm run start:tunnel`) |
| `eas-cli` | Expo | Cloud APK/IPA builds (`npm run build:apk`) |

`@expo/vector-icons` (Ionicons) ships with Expo — used for settings and theme icons.

New packages are added to this table only after verifying trustworthiness and necessity.

## Planned dependencies (v1.2+)

| Package | Purpose |
|---------|---------|
| `expo-sharing` or RN `Share` | Native share sheet (WhatsApp, Messages, etc.) |
| `expo-haptics` | Key press and win feedback |
| `eas-cli` | Standalone builds (APK/IPA) |

## Development environment

| Requirement | Notes |
|-------------|-------|
| Node.js 20+ | LTS recommended |
| npm | Package manager |
| Expo Go (phone) | SDK 54; App Store / Play Store |
| Same Wi-Fi or tunnel | Wireless QR dev |

## Commands

```bash
npm install --legacy-peer-deps
npm start                  # LAN
npm run start:tunnel       # when LAN/firewall blocks phone
npm test                   # unit tests
npm run build:words        # regenerate word lists
npm run build:sounds       # regenerate win/loss WAV tones
npm run build:music        # regenerate ambient background loop (see Audio assets below)
```

## Audio assets

Gridly bundles short game-end tones and one ambient background loop under `assets/sounds/`. Playback uses `expo-audio` (`gameEndSound.ts`, `backgroundMusic.ts`).

| File | Source | Approx. size |
|------|--------|--------------|
| `game-win.wav`, `game-loss.wav` | `scripts/generate-game-end-sounds.mjs` | ~70 KB total |
| `background-music.m4a` | [Exploration Theme](https://opengameart.org/) by Cleyton Kauffman (CC0) — converted from bundled `.ogg` | ~1.6 MB |

Optional attribution (not required by license): *Music by Cleyton Kauffman — https://soundcloud.com/cleytonkauffman*

### Regenerate the procedural background loop

The shipped app uses **Exploration Theme** (see table above). To go back to the built-in procedural loop, or to tweak it, from the project root:

```bash
npm run build:music
```

This runs `scripts/generate-background-music.mjs`, which:

1. Writes a 36-second seamless mono WAV (22050 Hz) with a calm pentatonic ambient pattern.
2. On macOS, converts it to AAC with `afconvert` and deletes the intermediate WAV.
3. Outputs `assets/sounds/background-music.m4a`.

To change the melody, length, or mix, edit the constants and `MELODY` table in `scripts/generate-background-music.mjs`, then rerun `npm run build:music`.

**Without macOS `afconvert`:** the script leaves `background-music.wav` in place. Convert manually, then replace the bundled file:

```bash
afconvert background-music.wav background-music.m4a -f m4af -d aac
```

(Argument order matters on some macOS versions: input, output, then `-f m4af -d aac`.)

Commit the updated `.m4a` after regenerating so EAS builds pick it up.

### Replace the background track

To swap in another licensed track (as with Exploration Theme from OpenGameArt):

1. Confirm the license allows commercial mobile use (CC0, CC-BY, etc.).
2. Convert to **AAC in `.m4a`**. Example:

```bash
afconvert "path/to/source.ogg" assets/sounds/background-music.m4a -f m4af -d aac -b 96000
```

3. Replace `assets/sounds/background-music.m4a` — **no code changes** (`backgroundMusic.ts` already requires this path).
4. Update the asset table in this section with attribution if required by the license.
5. Rebuild or publish an OTA update; verify volume feels right at default (~45% in code).

**Suggested sources** (verify license per track before shipping):

| Source | Search terms |
|--------|----------------|
| [Kenney](https://kenney.nl/assets?q=music) | ambient, puzzle |
| [OpenGameArt](https://opengameart.org/) | calm loop, puzzle ambient |
| [Pixabay Music](https://pixabay.com/music/) | lo-fi ambient game |

Win/loss tones are separate; only replace `background-music.m4a` unless you also regenerate `game-win.wav` / `game-loss.wav` via `npm run build:sounds`.

## Wireless development workflow

1. Install **Expo Go** on the phone (SDK 54).
2. Run `npm start` or `npm run start:tunnel`.
3. Scan the QR code.
4. App reloads on save (Fast Refresh).

No Xcode or Android Studio is required for Expo Go validation.

### Troubleshooting Expo Go on a work laptop

| Symptom | Fix |
|---------|-----|
| "Failed to download remote update" | Use `npm run start:tunnel` |
| Tunnel asks to install ngrok globally | Use local `@expo/ngrok`; decline global install |
| SDK mismatch | Match project SDK to Expo Go (`expo@~54`) |
| LAN blocked | Prefer tunnel over `exp://192.168.x.x:8081` |
| Notifications don't schedule | Expected in Expo Go; use `npx expo run:ios` or EAS Build |

## Project layout

```
gridly/
├── app/
│   ├── _layout.tsx
│   ├── index.tsx              # Home
│   ├── game.tsx               # Puzzle
│   ├── stats.tsx
│   ├── settings.tsx
│   └── how-to-play.tsx        # Interactive tutorial
├── src/
│   ├── components/
│   ├── core/
│   │   ├── gameEngine.ts
│   │   ├── dailyWord.ts
│   │   ├── hardMode.ts
│   │   ├── share.ts
│   │   ├── persistedGame.ts
│   │   ├── tutorialScript.ts
│   │   └── __tests__/
│   ├── stores/
│   │   ├── gameStore.ts
│   │   ├── gamePersistence.ts
│   │   ├── statsStore.ts
│   │   └── settingsStore.ts
│   ├── services/
│   │   ├── storage.ts
│   │   └── notifications.ts
│   ├── theme/
│   └── data/
│       ├── words.json
│       └── allowed-guesses.json
├── scripts/
│   └── build-word-lists.mjs
├── assets/
├── specs/
├── app.json
└── package.json
```

## Build an APK (no Android Studio)

Use **EAS Build** — Expo compiles the app in the cloud. You download an `.apk` and sideload it on your phone.

### One-time setup

1. Create a free account at [expo.dev](https://expo.dev).
2. From the **gridly** project folder (uses `registry.npmjs.org`, not the corporate global registry):

```bash
cd ~/gridly
npm install --legacy-peer-deps    # if node_modules missing
npm run eas login
npm run eas build:configure       # first time only
```

Do **not** use `npm install -g eas-cli` on a work laptop — global npm uses the Autodesk registry and fails.

If `npm install` hits cache permission errors:

```bash
npm install --legacy-peer-deps --cache /tmp/npm-cache-gridly
```

Or fix once: `sudo chown -R $(whoami) ~/.npm`

### Build the APK

```bash
npm run build:apk
```

- Build runs on Expo’s servers (~10–20 minutes).
- When done, the terminal prints a **download URL** (also on [expo.dev](https://expo.dev) → your project → Builds).
- Open that URL on your phone, download the `.apk`, and install (allow “Install unknown apps” for the browser if Android asks).

### Notes

| Topic | Detail |
|-------|--------|
| Cost | Free tier includes limited cloud builds per month |
| Expo Go | Not needed after install — this is a standalone app |
| Notifications | Work in this build (unlike Expo Go) |
| Updates | Re-run `npm run build:apk` after code changes |
| iOS | Same flow with `eas build --platform ios --profile preview` (needs Apple ID; install via link, not APK) |

Local `npm run android` still requires Android Studio; **EAS is the path without it**.

## Build and distribution

| Target | Tool | Notes |
|--------|------|-------|
| Dev validation | Expo Go | Current workflow |
| Internal Android APK | EAS Build | Requires dev build for notifications |
| iOS TestFlight | EAS Build | Apple Developer account |
| Play Store / App Store | EAS Submit | Production release |

## Configuration

- App name: **Gridly**
- Slug: `gridly`
- Scheme: `gridly`
- Icon and splash: see [branding.md](./branding.md)
