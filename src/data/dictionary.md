# Dictionary sources

Gridly validates guesses against a bundled **allowed guesses** list and picks secret words from a curated **answers** list.

## Allowed guesses

| Property | Value |
|----------|-------|
| File | `allowed-guesses.json` |
| Standard | **ENABLE-1** (Enhanced North American Benchmark Lexicon) — the same word-list family Wordle uses for guess validation |
| Size | ~8,900–10,000 five-letter words |

### How the file is built

Run from the project root:

```bash
npm run build:words
```

The script (`scripts/build-word-lists.mjs`) reads words in this order:

1. **`src/data/sources/enable1.txt`** — preferred; official ENABLE-1 list (one word per line)
2. **`/usr/share/dict/words`** — fallback on macOS/Linux (Webster-style system dictionary)

Only **five-letter A–Z words** are included. All answer words are merged into the allowed set.

To use ENABLE-1 explicitly, download `enable1.txt` from a trusted mirror and place it in `src/data/sources/`. The [ENABLE license](https://www.wordgamedictionary.com/enable/) permits free use in word games.

## Answer words

| Property | Value |
|----------|-------|
| File | `words.json` → `answers` |
| Purpose | Secret words for new games |
| Size | ~530 common five-letter words |

Answer words are a **curated subset** of familiar English words. Every answer must appear in the allowed guesses list.

## Runtime loading

`src/core/wordLists.ts` loads both files at startup and exposes `allowedGuessSet` as a `Set` for O(1) validation.
