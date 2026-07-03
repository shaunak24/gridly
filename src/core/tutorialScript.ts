export const TUTORIAL_SECRET = 'CRANE';

export type TutorialStepKind = 'continue' | 'type';

export interface TutorialStep {
  id: string;
  message: string;
  kind: TutorialStepKind;
  expectedWord?: string;
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'intro',
    kind: 'continue',
    message:
      'Welcome to Gridly! Guess the hidden 5-letter word in six tries. Each guess must be a valid English word.',
  },
  {
    id: 'guess1_prompt',
    kind: 'type',
    expectedWord: 'REACT',
    message: 'Let’s try a guess. Type REACT on the keyboard, then tap Enter.',
  },
  {
    id: 'guess1_explain',
    kind: 'continue',
    message:
      'Teal means correct letter, correct spot — like A here. Amber means the letter is in the word but wrong spot — like R, C, and E. Slate means the letter is not in the word — like T.',
  },
  {
    id: 'guess2_prompt',
    kind: 'type',
    expectedWord: 'BRAVE',
    message: 'Use those clues! Type BRAVE for your second guess.',
  },
  {
    id: 'guess2_explain',
    kind: 'continue',
    message:
      'Nice! R and E are teal — locked in the right spots. A is still amber, so it belongs somewhere else in the word.',
  },
  {
    id: 'guess3_prompt',
    kind: 'type',
    expectedWord: 'CRANE',
    message: 'You’re close. Type CRANE to solve the puzzle!',
  },
  {
    id: 'complete',
    kind: 'continue',
    message: 'You got it! You’re ready to play Daily and Practice. Tap below when you’re set.',
  },
];

export const FLIP_REVEAL_MS = 1200;
