/**
 * Builds words.json (answer words) and allowed-guesses.json from a dictionary source.
 *
 * Preferred source: ENABLE-1 (the same word-list family used by Wordle).
 * Place enable1.txt in src/games/word-hunt/data/sources/enable1.txt (one word per line).
 *
 * Fallback (macOS/Linux): /usr/share/dict/words
 *
 * Usage: node scripts/build-word-lists.mjs
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const sourcesDir = join(root, 'src/games/word-hunt/data/sources');
const enablePath = join(sourcesDir, 'enable1.txt');
const systemDict = '/usr/share/dict/words';
const answersPath = join(root, 'src/games/word-hunt/data/words.json');
const outputPath = join(root, 'src/games/word-hunt/data/allowed-guesses.json');

function readLines(path) {
  return readFileSync(path, 'utf8')
    .split(/\r?\n/)
    .map((w) => w.trim().toUpperCase())
    .filter((w) => /^[A-Z]{5}$/.test(w));
}

function readSystemDict() {
  if (!existsSync(systemDict)) {
    throw new Error(`No dictionary found. Add ${enablePath} or install system dict.`);
  }
  const raw = execSync(`grep -E '^[a-zA-Z]{5}$' ${systemDict}`, { encoding: 'utf8' });
  return raw
    .trim()
    .split('\n')
    .map((w) => w.toUpperCase());
}

let sourceName;
let words;

if (existsSync(enablePath)) {
  sourceName = 'ENABLE-1 (src/games/word-hunt/data/sources/enable1.txt)';
  words = readLines(enablePath);
} else if (existsSync(systemDict)) {
  sourceName = `system dictionary (${systemDict})`;
  words = readSystemDict();
} else {
  throw new Error('No dictionary source available.');
}

const answers = [...new Set(words)].sort();
const allowed = answers;

writeFileSync(answersPath, `${JSON.stringify({ answers }, null, 2)}\n`);
writeFileSync(outputPath, JSON.stringify(allowed));

console.log(`Source: ${sourceName}`);
console.log(`Answer words: ${answers.length}`);
console.log(`Allowed guesses: ${allowed.length}`);
console.log(`Wrote ${answersPath}`);
console.log(`Wrote ${outputPath}`);
