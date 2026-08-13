# Google Play store listing — Gridly

Copy the fields below into [Google Play Console](https://play.google.com/console/) → **Grow users** → **Store presence** → **Main store listing**.

**Package name:** `com.gridlygames.app`  
**App icon:** `assets/icon.png` (512×512 upload; source is 1024×1024)  
**Feature graphic:** `assets/store/feature-graphic.png` (1024×500)  
**Screenshots:** `assets/store/screenshots/` — see [README](../../assets/store/screenshots/README.md) for filenames and suggested upload order

**Status:** Main store listing completed in Play Console (Aug 2026). Next: closed testing after Phase 1–2 (EAS credentials + production build config).

---

## App name

```
Gridly
```

(30 character max on Play; "Gridly" fits.)

---

## Short description

80 characters max. Current draft (79 characters):

```
Daily word, photo & color puzzles. Free to play. Optional account to sync stats.
```

**Alternates:**

```
Word Hunt, Grid Snap & Color Flow — three daily grid puzzles. Play free.
```
(72 characters)

```
Three grid puzzle games: guess words, snap photos, connect colors. Free.
```
(73 characters)

---

## Full description

4000 characters max. Current draft:

```
Gridly is a collection of thoughtful grid-based puzzle games — one app, three ways to play. Pick a daily challenge or practice anytime. Dark, polished UI built for quick sessions on your phone.

🎮 THREE GAMES

• Word Hunt — Guess the five-letter word in six tries. Daily puzzle, unlimited practice, hard mode, and custom puzzles you can share with friends.

• Grid Snap — Drag photo tiles into place until the image clicks together. Daily challenge and practice modes with Easy (4×4), Medium (6×6), and Hard (8×8) grids.

• Color Flow — Draw paths to connect matching dots and fill every cell. Daily and practice puzzles from relaxing 6×6 boards up to 8×8 hard mode.

✨ FEATURES

• Daily puzzles with streak tracking across all three games
• Timers and meaningful win stats on Grid Snap and Color Flow
• Optional free account — sync stats and settings across devices
• Continue as guest — no sign-in required to play
• Per-game daily reminders you control
• Share custom Word Hunt puzzles via link
• Dark, light, or system theme

🔒 PRIVACY

Guest play keeps your progress on your device. Sign in only if you want cloud sync. No ads.

Download Gridly and make the grids your daily ritual.
```

---

## Privacy policy URL

**Live (use in Play Console):**

```
https://sites.google.com/view/shaunakstudios-gridly/home
```

**Delete account URL:**

```
https://sites.google.com/view/shaunakstudios-gridly/delete-account
```

Source of truth in repo: [`docs/legal/privacy-policy.md`](../legal/privacy-policy.md). Update the Google Site when the repo copy changes.

---

## Sign-in details (App access)

Play Console → **Policy** → **App content** → **Sign-in details** (formerly App access).

**Select: No** — no part of the app is restricted.

| Criterion | Gridly |
|-----------|--------|
| Account required to play? | No — **Continue as guest** on welcome screen |
| All games accessible without login? | Yes — Word Hunt, Grid Snap, Color Flow |
| Payments / subscriptions? | No |
| Referral codes / QR required? | No (invite links are optional shares, not gates) |
| 2FA / biometric required? | No |

**Optional instructions for reviewers** (if Play Console asks for text):

```
Open the app and tap "Continue as guest". All games and features are available without signing in. Optional sign-in (email or Google) is only for cross-device stats sync.
```

---

## Data safety (Play Console questionnaire)

Use these answers as a starting point; adjust if your Supabase project adds analytics later.

| Question | Suggested answer |
|----------|------------------|
| Does your app collect or share user data? | Yes |
| Is all data encrypted in transit? | Yes (HTTPS) |
| Can users request data deletion? | Yes (via feedback / contact) |
| **Account info** (email) | Collected if user creates account; for app functionality; optional |
| **App activity** (game stats) | Collected; app functionality; optional (guests stay local) |
| **Messages** (feedback) | Collected if user submits feedback; optional |
| **Device or other IDs** | Typically "No" unless you add analytics SDKs |
| Ads | No |
| Data sold | No |

---

## Content rating

- Category: **Game** or **Puzzle**
- No violence, gambling, user-generated content beyond custom puzzle words shared by link
- No social features or chat

---

## App access (for Google reviewers)

**Play Console answer: No** (not restricted). See [Sign-in details](#sign-in-details-app-access) above.

All functionality is available without an account via guest play. Optional sign-in syncs stats across devices.

---

## Category

**Primary:** Games → Puzzle  
**Tags (if offered):** Puzzle, Word, Casual, Offline (partial — sync needs network)

---

## Target audience

**Age groups (select):** 13-15, 16-17, 18 and over

Do **not** select 5 and under or 6-8 (Word Hunt requires reading). 9-12 is optional if you want to mark family-friendly; may trigger extra Families questions.

**Designed primarily for children?** No

---

## Account creation (Data safety — Step 2)

**Which methods of account creation does your app support?** Select:

- [x] **Username and password** — email + password sign-up in the app
- [x] **OAuth** — Sign in with Google

Do **not** select:

- Username and other authentication (no username-only or passwordless login)
- Username, password, and other authentication (no 2FA / biometric / OTP)
- Other
- My app does not allow users to create an account *(accounts are optional but supported)*

Guest play does not create an account; sign-up is optional.

### Delete account URL

Publish [`docs/legal/delete-account.md`](../legal/delete-account.md) on your Google Site (recommended: a page titled **Delete account** under the same site as the privacy policy).

Until that page is live, you can use the privacy policy URL only if the **Delete your account** section is visible on that page — Google prefers a dedicated URL.

Example after publishing:

```
https://sites.google.com/view/shaunakstudios-gridly/delete-account
```

*(Adjust to match your actual Google Sites page URL.)*

### Delete some data without deleting account? (optional)

**Select: No**

Gridly has no in-app control to delete synced stats while keeping the account. Guest/local data can be cleared by uninstalling or clearing app storage, but that is not a separate “request deletion” flow.

### Additional badges

- **Independent security review:** No
- **UPI Payments verified:** No

