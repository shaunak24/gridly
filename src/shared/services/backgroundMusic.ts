import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

import { playbackRateForRemaining } from '../core/musicUrgency';

const BACKGROUND_MUSIC = require('../../../assets/sounds/background-music.m4a');

export const BACKGROUND_MUSIC_VOLUME = 0.45;
const DUCKED_VOLUME = 0.14;
const DUCK_RESTORE_MS = 900;

let audioReady = false;
let musicPlayer: AudioPlayer | null = null;
let shouldBePlaying = false;
let enabled = true;
let urgencyRemainingSec: number | null = null;
let duckTimeout: ReturnType<typeof setTimeout> | null = null;

function clearDuckTimeout(): void {
  if (duckTimeout) {
    clearTimeout(duckTimeout);
    duckTimeout = null;
  }
}

function applyPlaybackRate(): void {
  if (!musicPlayer) {
    return;
  }

  const rate = playbackRateForRemaining(urgencyRemainingSec);
  try {
    musicPlayer.setPlaybackRate(rate, 'high');
  } catch {
    // Optional feedback — ignore on unsupported runtimes.
  }
}

function applyVolume(volume: number): void {
  if (!musicPlayer) {
    return;
  }
  musicPlayer.volume = volume;
}

async function ensureAudioReady(): Promise<void> {
  if (audioReady) {
    return;
  }

  await setAudioModeAsync({
    playsInSilentMode: true,
    interruptionMode: 'mixWithOthers',
    shouldPlayInBackground: false,
  });

  musicPlayer = createAudioPlayer(BACKGROUND_MUSIC);
  musicPlayer.loop = true;
  musicPlayer.volume = BACKGROUND_MUSIC_VOLUME;
  applyPlaybackRate();
  audioReady = true;
}

async function syncPlayback(): Promise<void> {
  if (!enabled || !shouldBePlaying) {
    musicPlayer?.pause();
    return;
  }

  await ensureAudioReady();
  if (!musicPlayer) {
    return;
  }

  applyPlaybackRate();
  applyVolume(BACKGROUND_MUSIC_VOLUME);
  musicPlayer.play();
}

export function setBackgroundMusicEnabled(nextEnabled: boolean): void {
  enabled = nextEnabled;
  void syncPlayback();
}

export function setBackgroundMusicActive(active: boolean): void {
  shouldBePlaying = active;
  if (!active) {
    urgencyRemainingSec = null;
    applyPlaybackRate();
  }
  void syncPlayback();
}

export function setMusicUrgency(remainingSec: number | null): void {
  urgencyRemainingSec = remainingSec;
  applyPlaybackRate();
}

export async function duckBackgroundMusic(): Promise<void> {
  if (!musicPlayer || !shouldBePlaying || !enabled) {
    return;
  }

  clearDuckTimeout();
  applyVolume(DUCKED_VOLUME);
  duckTimeout = setTimeout(() => {
    duckTimeout = null;
    if (shouldBePlaying && enabled) {
      applyVolume(BACKGROUND_MUSIC_VOLUME);
    }
  }, DUCK_RESTORE_MS);
}
