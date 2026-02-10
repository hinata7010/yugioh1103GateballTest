import type { AxisScores } from './deck';

export interface AnswerEffect {
  axis: keyof AxisScores;  // "stability", "tempo", etc.
  value: number;           // +1, +2, -1
}

export interface Answer {
  id: string;
  text: string;            // "안전한 루트로 간다"
  effects: AnswerEffect[]; // 1~2개 축에 영향
}

export interface Question {
  id: string;
  text: string;            // "전개 중 선택지가 갈릴 때 당신은?"
  type?: 'single' | 'tags'; // 질문 타입 (기본값: single)
  answers: Answer[];       // 3~5개 선택지
}
