import config from '../data/config.json';
import decksData from '../data/decks.json';
import type { AxisScores, Deck, MatchResult } from '../types';

/**
 * 코사인 유사도 계산 (Cosine Similarity)
 * 두 벡터의 패턴/방향성을 비교 (-1 ~ 1)
 * 1에 가까울수록 유사한 패턴
 */
export function calculateCosineSimilarity(
  userScores: AxisScores,
  deckScores: AxisScores
): number {
  const axes: (keyof AxisScores)[] = ['stability', 'difficulty', 'ceiling', 'tempo', 'niche', 'interaction', 'power'];
  const weights = config.weights;
  const CENTER = 5.5; // 1~10 범위의 중간값

  let dotProduct = 0;
  let userMagnitude = 0;
  let deckMagnitude = 0;

  // 중심화 + 가중치를 적용한 코사인 유사도
  axes.forEach(axis => {
    const weight = weights[axis] || 1;
    // 중심화: 5.5를 빼서 -4.5 ~ +4.5 범위로 변환
    const userValue = (userScores[axis] - CENTER) * weight;
    const deckValue = (deckScores[axis] - CENTER) * weight;

    dotProduct += userValue * deckValue;
    userMagnitude += userValue * userValue;
    deckMagnitude += deckValue * deckValue;
  });

  userMagnitude = Math.sqrt(userMagnitude);
  deckMagnitude = Math.sqrt(deckMagnitude);

  // 0으로 나누기 방지
  if (userMagnitude === 0 || deckMagnitude === 0) {
    console.warn('calculateCosineSimilarity: Zero magnitude detected');
    return 0;
  }

  const similarity = dotProduct / (userMagnitude * deckMagnitude);

  // 첫 번째 덱만 상세 로그
  if (Math.random() < 0.05) { // 5% 확률로 로그 (너무 많이 안 찍히게)
    console.log('Sample calculation (centered):');
    console.log('  userScores:', userScores);
    console.log('  deckScores:', deckScores);
    console.log('  dotProduct:', dotProduct, 'userMag:', userMagnitude, 'deckMag:', deckMagnitude);
    console.log('  similarity:', similarity);
  }

  return similarity;
}

/**
 * @deprecated 이전 거리 기반 방식 (호환성 유지)
 */
export function calculateDistance(
  userScores: AxisScores,
  deckScores: AxisScores
): number {
  const weights = config.weights;
  let totalDistance = 0;

  for (const axis in weights) {
    const weight = weights[axis as keyof typeof weights];
    const diff = Math.abs(
      userScores[axis as keyof AxisScores] -
      deckScores[axis as keyof AxisScores]
    );
    totalDistance += weight * diff;
  }

  return totalDistance;
}

export function findMatches(userScores: AxisScores, selectedTags: string[] = []): MatchResult[] {
  // 태그 필터링
  let filteredDecks = decksData as Deck[];

  console.log('findMatches - Total decks:', filteredDecks.length);
  console.log('findMatches - selectedTags:', selectedTags);
  console.log('findMatches - selectedTags JSON:', JSON.stringify(selectedTags));
  console.log('findMatches - selectedTags length:', selectedTags.length);

  // "상관없음"이 아니고, 태그가 선택되었으면 필터링
  if (selectedTags.length > 0 && !selectedTags.includes('상관없음')) {
    console.log('findMatches - 태그 필터링 적용');
    // 선택된 태그가 있으면 해당 태그를 가진 덱만 필터링
    filteredDecks = filteredDecks.filter(deck => {
      const matches = deck.tags.some(tag => selectedTags.includes(tag));
      if (!matches) {
        console.log(`Deck ${deck.name} tags ${JSON.stringify(deck.tags)} - no match`);
      }
      return matches;
    });
    console.log('findMatches - Filtered decks count:', filteredDecks.length);
  } else if (selectedTags.includes('상관없음')) {
    console.log('findMatches - 상관없음 선택됨, 모든 덱 표시');
  }

  // 코사인 유사도 계산
  const results = filteredDecks.map(deck => {
    const similarity = calculateCosineSimilarity(userScores, deck.scores);

    // 코사인 유사도를 0~100% 범위로 변환
    // -1 ~ 1 범위를 0 ~ 100으로: (similarity + 1) * 50
    const matchPercentage = Math.max(0, Math.min(100, (similarity + 1) * 50));

    // distance는 호환성을 위해 유지 (낮을수록 좋음)
    const distance = 1 - similarity;

    console.log(`Deck: ${deck.name}, similarity: ${similarity.toFixed(4)}, matchPercentage: ${matchPercentage.toFixed(2)}%`);

    return {
      deck,
      distance,
      matchPercentage,
      similarity // 디버깅용
    };
  });

  // 유사도 내림차순 정렬 (가장 유사한 덱이 첫 번째)
  return results.sort((a, b) => b.matchPercentage - a.matchPercentage);
}
