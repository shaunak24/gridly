import allowedGuessesData from '../data/allowed-guesses.json';
import answerData from '../data/words.json';

export interface WordLists {
  answers: string[];
  allowedGuessSet: ReadonlySet<string>;
}

export const wordLists: WordLists = {
  answers: answerData.answers,
  allowedGuessSet: new Set(allowedGuessesData),
};
