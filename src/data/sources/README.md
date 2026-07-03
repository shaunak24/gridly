# Dictionary source files

Place **enable1.txt** here for ENABLE-1 (Wordle-style) guess validation.

Download from a trusted source (e.g. [Word Game Dictionary ENABLE](https://www.wordgamedictionary.com/enable/)) and run:

```bash
npm run build:words
```

If this file is absent, `build:words` uses `/usr/share/dict/words` on macOS/Linux.
