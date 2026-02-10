import type { AxisScores, Question } from '../types';

export function normalizeScores(
  rawScores: Record<string, number>,
  maxScores: Map<string, number>
): AxisScores {
  console.log('normalizeScores input - rawScores:', rawScores);
  console.log('normalizeScores input - maxScores:', Object.fromEntries(maxScores));

  const normalized = {} as AxisScores;

  // tags 제외
  const axes: (keyof AxisScores)[] = ['stability', 'difficulty', 'ceiling', 'tempo', 'niche', 'interaction', 'power'];

  for (const axis of axes) {
    const raw = rawScores[axis] || 0;
    const max = maxScores.get(axis) || 0;
    const min = -(maxScores.get(axis) || 0); // 최소값은 음수 방향

    // 1~10 범위로 정규화
    // min점 = 1, 0점 = 5.5, max점 = 10
    if (max > 0) {
      const range = max - min;
      const normalizedValue = 1 + ((raw - min) / range) * 9;
      normalized[axis] = normalizedValue;
      console.log(`${axis}: raw=${raw}, max=${max}, min=${min}, range=${range}, normalized=${normalizedValue}`);
    } else {
      normalized[axis] = 5.5; // 기본값 (중간)
      console.log(`${axis}: no data, using default 5.5`);
    }
  }

  console.log('Normalized scores:', normalized);
  return normalized;
}

// 질문 데이터에서 각 축의 최대/최소 가능 점수 계산
export function calculateMaxScores(questions: Question[]): Map<string, number> {
  const maxScores = new Map<string, number>();

  // 각 질문에서 각 축의 최대 양수/음수 효과를 찾아서 합산
  questions.forEach(question => {
    const questionMaxPerAxis = new Map<string, number>();

    question.answers.forEach(answer => {
      answer.effects.forEach(effect => {
        const current = questionMaxPerAxis.get(effect.axis) || 0;
        // 각 질문 내에서 최대 양수 효과만 추적
        if (effect.value > 0 && effect.value > current) {
          questionMaxPerAxis.set(effect.axis, effect.value);
        }
      });
    });

    // 이 질문의 최대값들을 전체 최대값에 합산
    questionMaxPerAxis.forEach((value, axis) => {
      const total = maxScores.get(axis) || 0;
      maxScores.set(axis, total + value);
    });
  });

  console.log('Calculated max scores:', Object.fromEntries(maxScores));
  return maxScores;
}
