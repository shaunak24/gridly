# Branding

## Name

**Gridly** — a daily-style word grid puzzle. The name references the 5×6 game board.

## Logo

### App icon

- A **5×6 grid** of rounded squares forms the icon silhouette.
- One square — the dot of the letter **“i”** in Gridly — is **coral** (`#F97316`).
- One or two additional squares use **teal** or **amber** to suggest gameplay without mirroring Wordle’s palette.
- Remaining squares use muted violet (`#2D2A40`) on a deep indigo background (`#1E1B2E`).

### Wordmark

- Typeface: geometric sans-serif (**DM Sans** or **Outfit**).
- The **“i”** in Gridly is stylized: the stem aligns with a grid column; the tittle is the coral square.

## Color system

Gridly uses a palette distinct from Wordle (no green/yellow/gray board scheme).

| Role | Name | Hex |
|------|------|-----|
| Correct letter, correct position | Teal | `#14B8A6` |
| Correct letter, wrong position | Amber | `#F59E0B` |
| Letter not in word | Slate | `#64748B` |
| Screen background (dark) | Deep indigo | `#1E1B2E` |
| Empty tile | Muted violet | `#2D2A40` |
| Brand accent (logo, highlights) | Coral | `#F97316` |
| Primary text (dark mode) | Off-white | `#F8FAFC` |
| Secondary text | Cool gray | `#94A3B8` |

## Theme

- **Default:** dark mode aligned with the deep indigo board aesthetic.
- **Optional:** follow system light/dark preference (post-MVP enhancement).

## Assets

| Asset | Size | Usage |
|-------|------|-------|
| `icon.png` | 1024×1024 | App icon (`app.json`) |
| `splash.png` | 1284×2778 (or adaptive) | Launch splash |
| `adaptive-icon.png` | 1024×1024 | Android adaptive icon foreground |

Splash screen displays the grid icon centered on the deep indigo background with the Gridly wordmark below.

### Game icons

Each game has a programmatic icon (React Native views, theme-aware) used on its hub screen and on the platform home game card.

| Game | Icon | Description |
|------|------|-------------|
| Word Hunt | `WordHuntIcon` | Two rows of five letter tiles with guess feedback (teal/amber/slate) — a mixed guess above a solved row |
| Grid Snap | `GridSnapIcon` | Photo-fragment tiles: a flush 2×2 snapped landscape group plus loose offset pieces still out of place |

Icons scale via a `size` prop (hub ~96px, game card ~52px).
