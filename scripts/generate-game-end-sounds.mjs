#!/usr/bin/env node
/**
 * Generates short win/loss WAV tones for game-end feedback (no external assets).
 * Run: node scripts/generate-game-end-sounds.mjs
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '../assets/sounds');

function writeWav(path, frequencies, durationSec, sampleRate = 44100) {
  const numSamples = Math.floor(sampleRate * durationSec);
  const dataSize = numSamples * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < numSamples; i += 1) {
    const t = i / sampleRate;
    const attack = Math.min(1, t / 0.02);
    const release = Math.min(1, (durationSec - t) / 0.08);
    const envelope = Math.max(0, attack * release);

    let sample = 0;
    for (const freq of frequencies) {
      sample += Math.sin(2 * Math.PI * freq * t);
    }
    sample = (sample / frequencies.length) * envelope * 0.35;
    buffer.writeInt16LE(Math.max(-32767, Math.min(32767, Math.floor(sample * 32767))), 44 + i * 2);
  }

  writeFileSync(path, buffer);
}

mkdirSync(outDir, { recursive: true });
writeWav(join(outDir, 'game-win.wav'), [523.25, 659.25, 783.99], 0.45);
writeWav(join(outDir, 'game-loss.wav'), [220, 196], 0.35);
console.log('Wrote game-win.wav and game-loss.wav');
