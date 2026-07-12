# Dictionary source files

Place **enable1.txt** here for ENABLE-1 (Wordle-style) word lists.

Download from a trusted source (e.g. [Word Game Dictionary ENABLE](https://www.wordgamedictionary.com/enable/)) and run:

```bash
npm run build:words
```

This regenerates `src/data/words.json` (answer words) and `src/data/allowed-guesses.json` (guess validation) from all five-letter words in the source file.

If this file is absent, `build:words` uses `/usr/share/dict/words` on macOS/Linux.
