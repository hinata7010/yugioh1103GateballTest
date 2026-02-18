import type { AxisScores, Question } from '../types';

export function normalizeScores(
  rawScores: Record<string, number>,
  maxScores: Map<string, number>
): AxisScores {

  const normalized = {} as AxisScores;

  // tags ?쒖쇅
  const axes: (keyof AxisScores)[] = ['stability', 'difficulty', 'ceiling', 'tempo', 'niche', 'interaction', 'power'];

  for (const axis of axes) {
    const raw = rawScores[axis] || 0;
    const max = maxScores.get(axis) || 0;
    const min = -(maxScores.get(axis) || 0); // 理쒖냼媛믪? ?뚯닔 諛⑺뼢

    // 1~10 踰붿쐞濡??뺢퇋??    // min??= 1, 0??= 5.5, max??= 10
    if (max > 0) {
      const range = max - min;
      const normalizedValue = 1 + ((raw - min) / range) * 9;
      normalized[axis] = normalizedValue;
    } else {
      normalized[axis] = 5.5; // 湲곕낯媛?(以묎컙)
    }
  }

  return normalized;
}

// 吏덈Ц ?곗씠?곗뿉??媛?異뺤쓽 理쒕?/理쒖냼 媛???먯닔 怨꾩궛
export function calculateMaxScores(questions: Question[]): Map<string, number> {
  const maxScores = new Map<string, number>();

  // 媛?吏덈Ц?먯꽌 媛?異뺤쓽 理쒕? ?묒닔/?뚯닔 ?④낵瑜?李얠븘???⑹궛
  questions.forEach(question => {
    const questionMaxPerAxis = new Map<string, number>();

    question.answers.forEach(answer => {
      answer.effects.forEach(effect => {
        const current = questionMaxPerAxis.get(effect.axis) || 0;
        // 媛?吏덈Ц ?댁뿉??理쒕? ?묒닔 ?④낵留?異붿쟻
        if (effect.value > 0 && effect.value > current) {
          questionMaxPerAxis.set(effect.axis, effect.value);
        }
      });
    });

    // ??吏덈Ц??理쒕?媛믩뱾???꾩껜 理쒕?媛믪뿉 ?⑹궛
    questionMaxPerAxis.forEach((value, axis) => {
      const total = maxScores.get(axis) || 0;
      maxScores.set(axis, total + value);
    });
  });

  return maxScores;
}
