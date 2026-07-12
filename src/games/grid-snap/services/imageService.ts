const PEXELS_API = 'https://api.pexels.com/v1/curated';

export interface PuzzleImage {
  seed: string;
  url: string;
  width: number;
  height: number;
}

export function buildPicsumImageUrl(seed: string, size = 480): string {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${size}/${size}`;
}

export async function fetchPuzzleImage(seed: string): Promise<PuzzleImage> {
  const apiKey = process.env.EXPO_PUBLIC_PEXELS_API_KEY;
  if (apiKey) {
    try {
      const response = await fetch(`${PEXELS_API}?per_page=1&page=${hashPage(seed)}`, {
        headers: { Authorization: apiKey },
      });
      if (response.ok) {
        const data = (await response.json()) as {
          photos?: Array<{ src?: { landscape?: string }; width?: number; height?: number }>;
        };
        const photo = data.photos?.[0];
        if (photo?.src?.landscape) {
          return {
            seed,
            url: photo.src.landscape,
            width: photo.width ?? 480,
            height: photo.height ?? 480,
          };
        }
      }
    } catch {
      // Fall through to Picsum.
    }
  }

  const size = 480;
  return {
    seed,
    url: buildPicsumImageUrl(seed, size),
    width: size,
    height: size,
  };
}

function hashPage(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return (Math.abs(hash) % 1000) + 1;
}
