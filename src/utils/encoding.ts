import type { AxisScores } from '../types';

export function encodeScores(scores: AxisScores): string {
  const values = [
    scores.stability,
    scores.difficulty,
    scores.ceiling,
    scores.tempo,
    scores.niche,
    scores.interaction,
    scores.power,
  ];

  return values
    .map((v) => {
      const num = Math.round(v * 100);
      return num.toString(16).padStart(3, '0');
    })
    .join('');
}

export function decodeScores(encoded: string): AxisScores | null {
  try {
    const axes = [
      'stability',
      'difficulty',
      'ceiling',
      'tempo',
      'niche',
      'interaction',
      'power',
    ] as const;

    const isLegacy = encoded.length === 14;
    const isCurrent = encoded.length === 21;

    if (!isLegacy && !isCurrent) {
      return null;
    }

    const scores = {} as AxisScores;

    for (let i = 0; i < 7; i++) {
      const axis = axes[i] as keyof AxisScores;
      const width = isLegacy ? 2 : 3;
      const start = i * width;
      const hex = encoded.substring(start, start + width);
      const parsed = parseInt(hex, 16);
      const value = parsed / (isLegacy ? 10 : 100);

      if (value < 0 || value > 10.5) {
        throw new Error(`Invalid score for ${axis}: ${value}`);
      }

      scores[axis] = value;
    }

    return scores;
  } catch {
    return null;
  }
}

export function encodeTags(tags: string[]): string {
  return tags.join('|');
}

export function decodeTags(encoded: string): string[] {
  if (!encoded) return [];
  return encoded
    .split('|')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function generateShareUrl(scores: AxisScores, selectedTags: string[] = []): string {
  const url = new URL('/results', window.location.origin);
  url.searchParams.set('s', encodeScores(scores));

  if (selectedTags.length > 0) {
    url.searchParams.set('t', encodeTags(selectedTags));
  }

  return url.toString();
}
