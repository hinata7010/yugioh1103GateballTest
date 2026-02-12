export interface AxisScores {
  stability: number;      // 안정성 (1-10)
  difficulty: number;     // 난이도 (1-10)
  ceiling: number;        // 고점 (1-10)
  tempo: number;          // 템포 (1-10)
  niche: number;          // 비주류 (1-10)
  interaction: number;    // 상호작용 (1-10)
  power: number;          // 파워 (1-10)
}

export interface Deck {
  id: string;
  name: string;           // "퀵정크도플"
  commentary: string;     // 덱 코멘트 (결과 화면용)
  image: string;          // "/images/decks/quick-junk-doppel.jpg"
  tags: string[];         // ["싱크로", "엑시즈", "융합"]
  scores: AxisScores;
}


