import type { AxisScores } from '../types';

// 점수를 URL 안전 문자열로 인코딩
export function encodeScores(scores: AxisScores): string {
  const values = [
    scores.stability,
    scores.difficulty,
    scores.ceiling,
    scores.tempo,
    scores.niche,
    scores.interaction,
    scores.power
  ];

  // 각 값을 16진수 2자리로 인코딩 (소수점 1자리 * 10)
  return values
    .map(v => {
      const num = Math.round(v * 10);
      return num.toString(16).padStart(2, '0');
    })
    .join('');
}

// URL 문자열을 점수로 디코딩
export function decodeScores(encoded: string): AxisScores | null {
  try {
    console.log('decodeScores input:', encoded, 'length:', encoded.length);

    const axes = [
      'stability', 'difficulty', 'ceiling', 'tempo',
      'niche', 'interaction', 'power'
    ] as const;

    // 각 축당 2자리 = 총 14자
    if (encoded.length !== 14) {
      console.error('Invalid length:', encoded.length, 'expected 14');
      return null;
    }

    const scores = {} as AxisScores;

    for (let i = 0; i < 7; i++) {
      const axis = axes[i] as keyof AxisScores;
      const hex = encoded.substr(i * 2, 2);
      const parsed = parseInt(hex, 16);
      const value = parsed / 10;

      console.log(`${axis}: hex=${hex}, parsed=${parsed}, value=${value}`);

      if (value < 0 || value > 10.5) {
        throw new Error(`Invalid score for ${axis}: ${value}`);
      }
      scores[axis] = value;
    }

    console.log('Decoded scores:', scores);
    return scores;
  } catch (err) {
    console.error('decodeScores error:', err);
    return null;
  }
}

// 공유 URL 생성
export function generateShareUrl(scores: AxisScores): string {
  const encoded = encodeScores(scores);
  console.log('Generated share URL with encoded:', encoded);
  return `${window.location.origin}/results?s=${encoded}`;
}
