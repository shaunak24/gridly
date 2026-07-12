# Dictionary sources

Gridly validates guesses against a bundled **allowed guesses** list and picks secret words from the **answers** list. Both are generated from the same dictionary source.

## Allowed guesses

| Property | Value |
|----------|-------|
| File | `allowed-guesses.json` |
| Standard | **ENABLE-1** (Enhanced North American Benchmark Lexicon) — the same word-list family Wordle uses for guess validation |
| Size | ~8,600 five-letter words (ENABLE-1) |

### How the file is built

Run from the project root:

```bash
npm run build:words
```

The script (`scripts/build-word-lists.mjs`) reads words in this order:

1. **`src/data/sources/enable1.txt`** — preferred; official ENABLE-1 list (one word per line)
2. **`/usr/share/dict/words`** — fallback on macOS/Linux (Webster-style system dictionary)

Only **five-letter A–Z words** are included. Answer words and allowed guesses use the same ENABLE-1 five-letter set.

To use ENABLE-1 explicitly, download `enable1.txt` from a trusted mirror and place it in `src/data/sources/`. The [ENABLE license](https://www.wordgamedictionary.com/enable/) permits free use in word games.

## Answer words

| Property | Value |
|----------|-------|
| File | `words.json` → `answers` |
| Purpose | Secret words for new games |
| Size | ~8,600 five-letter words (ENABLE-1) |

Answer words are every five-letter word in the dictionary source — the same set as allowed guesses.

## Runtime loading

`src/games/word-hunt/core/wordLists.ts` loads both files at startup and exposes `allowedGuessSet` as a `Set` for O(1) validation.
