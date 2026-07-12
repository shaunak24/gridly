import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

import type { GameEndPresentation } from '../gameEnd/gameEndConfig';

const WIN_SOUND = require('../../../assets/sounds/game-win.wav');
const LOSS_SOUND = require('../../../assets/sounds/game-loss.wav');

let audioReady = false;
let winPlayer: AudioPlayer | null = null;
let lossPlayer: AudioPlayer | null = null;

async function ensureAudioReady(): Promise<void> {
  if (audioReady) {
    return;
  }

  await setAudioModeAsync({
    playsInSilentMode: true,
    interruptionMode: 'mixWithOthers',
    shouldPlayInBackground: false,
  });

  winPlayer = createAudioPlayer(WIN_SOUND);
  lossPlayer = createAudioPlayer(LOSS_SOUND);
  audioReady = true;
}

function replay(player: AudioPlayer): void {
  void player.seekTo(0).then(() => {
    player.play();
  });
}

export async function playGameEndSound(presentation: GameEndPresentation): Promise<void> {
  try {
    await ensureAudioReady();
    const player = presentation === 'won' ? winPlayer : lossPlayer;
    if (!player) {
      return;
    }
    replay(player);
  } catch {
    // Audio is optional feedback; ignore playback failures in Expo Go or muted devices.
  }
}
