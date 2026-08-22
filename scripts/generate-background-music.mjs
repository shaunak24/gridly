#!/usr/bin/env node
/**
 * Generates a seamless ambient loop for Gridly background music.
 * Output: assets/sounds/background-music.wav (then compressed to .m4a via afconvert on macOS).
 * Run: node scripts/generate-background-music.mjs
 */

import { execSync } from 'node:child_process';
import { writeFileSync, mkdirSync, unlinkSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '../assets/sounds');
const wavPath = join(outDir, 'background-music.wav');
const m4aPath = join(outDir, 'background-music.m4a');

const LOOP_SEC = 36;
const SAMPLE_RATE = 22050;

/** Pentatonic (C) — calm puzzle vibe aligned with Gridly teal/coral palette. */
const NOTES = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25];

/** Melody hits; pattern length equals LOOP_SEC for seamless repeat. */
const MELODY = [
  { at: 0, note: 0, dur: 2.8 },
  { at: 4, note: 2, dur: 2.2 },
  { at: 8, note: 4, dur: 2.6 },
  { at: 12, note: 3, dur: 2.0 },
  { at: 16, note: 1, dur: 2.4 },
  { at: 20, note: 4, dur: 2.8 },
  { at: 24, note: 2, dur: 2.0 },
  { at: 28, note: 5, dur: 2.2 },
  { at: 32, note: 3, dur: 2.5 },
];

function envelope(t, attack, release, duration) {
  const attackEnv = Math.min(1, t / attack);
  const releaseEnv = Math.min(1, (duration - t) / release);
  return Math.max(0, Math.min(attackEnv, releaseEnv));
}

function loopFade(t) {
  const edge = 0.35;
  if (t < edge) {
    return t / edge;
  }
  if (t > LOOP_SEC - edge) {
    return (LOOP_SEC - t) / edge;
  }
  return 1;
}

function sampleAt(t) {
  const lfo = 0.55 + 0.45 * Math.sin((2 * Math.PI * t) / 18);
  let sample = 0;

  sample += Math.sin(2 * Math.PI * 130.81 * t) * 0.07 * lfo;
  sample += Math.sin(2 * Math.PI * 196.0 * t) * 0.05 * lfo;
  sample += Math.sin(2 * Math.PI * 261.63 * t) * 0.025 * lfo;

  for (const hit of MELODY) {
    const localT = t - hit.at;
    if (localT >= 0 && localT < hit.dur) {
      const freq = NOTES[hit.note];
      const env = envelope(localT, 0.08, 0.35, hit.dur);
      sample += Math.sin(2 * Math.PI * freq * t) * env * 0.1;
      sample += Math.sin(2 * Math.PI * freq * 2 * t) * env * 0.03;
    }
  }

  return sample * loopFade(t) * 0.85;
}

function writeWav(path) {
  const numSamples = Math.floor(SAMPLE_RATE * LOOP_SEC);
  const dataSize = numSamples * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < numSamples; i += 1) {
    const t = i / SAMPLE_RATE;
    const sample = sampleAt(t);
    buffer.writeInt16LE(Math.max(-32767, Math.min(32767, Math.floor(sample * 32767))), 44 + i * 2);
  }

  writeFileSync(path, buffer);
}

mkdirSync(outDir, { recursive: true });
writeWav(wavPath);
console.log(`Wrote ${wavPath} (${LOOP_SEC}s @ ${SAMPLE_RATE} Hz)`);

try {
  execSync(`afconvert "${wavPath}" "${m4aPath}" -f m4af -d aac`, { stdio: 'inherit' });
  unlinkSync(wavPath);
  console.log(`Wrote ${m4aPath} (AAC)`);
} catch {
  console.warn('afconvert unavailable — ship background-music.wav or run afconvert manually.');
}
