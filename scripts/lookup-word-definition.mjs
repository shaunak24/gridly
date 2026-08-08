#!/usr/bin/env node
/**
 * Look up a word on the Free Dictionary API (same source as Word Hunt in-app).
 *
 * Usage:
 *   npm run lookup:definition -- crane
 *   npm run lookup:definition -- ranid
 */

const DICTIONARY_API = 'https://api.dictionaryapi.dev/api/v2/entries/en';

const wordArg = process.argv[2];

if (!wordArg || wordArg.startsWith('-')) {
  console.error('Usage: npm run lookup:definition -- <word>');
  process.exit(1);
}

const normalized = wordArg.trim().toLowerCase();
const url = `${DICTIONARY_API}/${encodeURIComponent(normalized)}`;

console.log(`GET ${url}\n`);

let response;
try {
  response = await fetch(url);
} catch (error) {
  console.error('Request failed:', error instanceof Error ? error.message : error);
  process.exit(1);
}

const rawText = await response.text();

console.log(`HTTP ${response.status} ${response.ok ? 'OK' : ''}\n`);

if (!response.ok) {
  console.log('--- body ---');
  console.log(rawText);
  process.exit(response.status === 404 ? 0 : 1);
}

let entries;
try {
  entries = JSON.parse(rawText);
} catch {
  console.log('--- body (invalid JSON) ---');
  console.log(rawText);
  process.exit(1);
}

console.log('--- summary ---');
const entry = entries[0];
const meaning = entry?.meanings?.[0];
const definition = meaning?.definitions?.[0]?.definition;

console.log('word:          ', entry?.word ?? normalized);
if (entry?.phonetic) {
  console.log('phonetic:      ', entry.phonetic);
}
console.log('part of speech:', meaning?.partOfSpeech ?? '(none)');
console.log('definition:    ', definition ?? '(none)');

const extraMeanings = (entry?.meanings ?? []).length;
const extraDefs = (meaning?.definitions ?? []).length;
if (extraMeanings > 1 || extraDefs > 1) {
  console.log(`\n(note: API returned ${extraMeanings} meaning(s); app uses the first definition only.)`);
}

console.log('\n--- raw JSON ---');
console.log(JSON.stringify(entries, null, 2));
