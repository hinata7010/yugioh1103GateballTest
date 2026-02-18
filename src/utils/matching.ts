import config from '../data/config.json';
import decksData from '../data/decks.json';
import type { AxisScores, Deck, MatchResult } from '../types';

export function calculateCosineSimilarity(userScores: AxisScores, deckScores: AxisScores): number {
  const axes: (keyof AxisScores)[] = [
    'stability',
    'difficulty',
    'ceiling',
    'tempo',
    'niche',
    'interaction',
    'power',
  ];
  const weights = config.weights;
  const center = 5.5;

  let dotProduct = 0;
  let userMagnitude = 0;
  let deckMagnitude = 0;

  for (const axis of axes) {
    const weight = weights[axis] || 1;
    const userValue = (userScores[axis] - center) * weight;
    const deckValue = (deckScores[axis] - center) * weight;

    dotProduct += userValue * deckValue;
    userMagnitude += userValue * userValue;
    deckMagnitude += deckValue * deckValue;
  }

  const userLength = Math.sqrt(userMagnitude);
  const deckLength = Math.sqrt(deckMagnitude);

  if (userLength === 0 || deckLength === 0) {
    return 0;
  }

  return dotProduct / (userLength * deckLength);
}

/**
 * @deprecated 거리 기반 계산(하위 호환용)
 */
export function calculateDistance(userScores: AxisScores, deckScores: AxisScores): number {
  const weights = config.weights;
  let totalDistance = 0;

  for (const axis in weights) {
    const key = axis as keyof AxisScores;
    const weight = weights[key] || 1;
    const diff = Math.abs(userScores[key] - deckScores[key]);
    totalDistance += weight * diff;
  }

  return totalDistance;
}

export function findMatches(userScores: AxisScores, selectedTags: string[] = []): MatchResult[] {
  let filteredDecks = decksData as Deck[];

  if (selectedTags.length > 0 && !selectedTags.includes('상관없음')) {
    filteredDecks = filteredDecks.filter((deck) =>
      deck.tags.some((tag) => selectedTags.includes(tag))
    );
  }

  const results = filteredDecks.map((deck) => {
    const similarity = calculateCosineSimilarity(userScores, deck.scores);
    const matchPercentage = Math.max(0, Math.min(100, (similarity + 1) * 50));

    return {
      deck,
      distance: 1 - similarity,
      matchPercentage,
      similarity,
    };
  });

  return results.sort((a, b) => b.matchPercentage - a.matchPercentage);
}
