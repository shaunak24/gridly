const DICTIONARY_API = 'https://api.dictionaryapi.dev/api/v2/entries/en';

const LOG_PREFIX = '[WordDefinition]';

export interface WordDefinition {
  text: string;
  partOfSpeech?: string;
}

interface DictionaryDefinition {
  definition?: string;
}

interface DictionaryMeaning {
  partOfSpeech?: string;
  definitions?: DictionaryDefinition[];
}

interface DictionaryEntry {
  word?: string;
  meanings?: DictionaryMeaning[];
}

function logDefinitionDebug(message: string, detail?: Record<string, unknown>): void {
  if (!__DEV__) {
    return;
  }

  if (detail) {
    console.log(LOG_PREFIX, message, detail);
  } else {
    console.log(LOG_PREFIX, message);
  }
}

export function parseDictionaryResponse(rawText: string): WordDefinition | null {
  let entries: DictionaryEntry[];
  try {
    entries = JSON.parse(rawText) as DictionaryEntry[];
  } catch {
    return null;
  }

  const meaning = entries[0]?.meanings?.[0];
  const definition = meaning?.definitions?.[0]?.definition;
  if (!definition || typeof definition !== 'string') {
    return null;
  }

  const partOfSpeech =
    typeof meaning?.partOfSpeech === 'string' ? meaning.partOfSpeech.trim() : undefined;

  return {
    text: definition.trim(),
    partOfSpeech: partOfSpeech || undefined,
  };
}

export async function fetchWordDefinition(word: string): Promise<WordDefinition | null> {
  const normalized = word.trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  const url = `${DICTIONARY_API}/${encodeURIComponent(normalized)}`;

  try {
    const response = await fetch(url);
    const rawText = await response.text();

    logDefinitionDebug('response', {
      word: normalized,
      status: response.status,
      ok: response.ok,
      bodyPreview: rawText.slice(0, 280),
    });

    if (!response.ok) {
      return null;
    }

    const parsed = parseDictionaryResponse(rawText);
    if (!parsed) {
      logDefinitionDebug('no definition in payload', { word: normalized });
      return null;
    }

    return parsed;
  } catch (error) {
    logDefinitionDebug('fetch failed', {
      word: normalized,
      url,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}
