/**
 * Builds allowed-guesses.json from a dictionary source file.
 *
 * Preferred source: ENABLE-1 (the same word-list family used by Wordle).
 * Place enable1.txt in src/data/sources/enable1.txt (one word per line).
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
const sourcesDir = join(root, 'src/data/sources');
const enablePath = join(sourcesDir, 'enable1.txt');
const systemDict = '/usr/share/dict/words';
const answersPath = join(root, 'src/data/words.json');
const outputPath = join(root, 'src/data/allowed-guesses.json');

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
  sourceName = 'ENABLE-1 (src/data/sources/enable1.txt)';
  words = readLines(enablePath);
} else if (existsSync(systemDict)) {
  sourceName = `system dictionary (${systemDict})`;
  words = readSystemDict();
} else {
  throw new Error('No dictionary source available.');
}

const answers = JSON.parse(readFileSync(answersPath, 'utf8')).answers;
const allowed = [...new Set([...words, ...answers])].sort();

writeFileSync(outputPath, JSON.stringify(allowed));

const missingAnswers = answers.filter((w) => !allowed.includes(w));
if (missingAnswers.length > 0) {
  console.warn('Answers not in allowed list:', missingAnswers.join(', '));
}

console.log(`Source: ${sourceName}`);
console.log(`Allowed guesses: ${allowed.length}`);
console.log(`Answer words: ${answers.length}`);
console.log(`Wrote ${outputPath}`);
