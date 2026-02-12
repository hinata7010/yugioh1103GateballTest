import { readFileSync } from 'fs';

const questionsData = JSON.parse(readFileSync('./src/data/questions.json', 'utf-8'));
const decksData = JSON.parse(readFileSync('./src/data/decks.json', 'utf-8'));
const configData = JSON.parse(readFileSync('./src/data/config.json', 'utf-8'));

const AXES = ['stability', 'difficulty', 'ceiling', 'tempo', 'niche', 'interaction', 'power'];
const CENTER = 5.5;

function calculateMaxScores(questions) {
  const maxScores = new Map();

  questions.forEach((question) => {
    const questionMaxPerAxis = new Map();

    question.answers.forEach((answer) => {
      answer.effects.forEach((effect) => {
        const current = questionMaxPerAxis.get(effect.axis) || 0;
        if (effect.value > 0 && effect.value > current) {
          questionMaxPerAxis.set(effect.axis, effect.value);
        }
      });
    });

    questionMaxPerAxis.forEach((value, axis) => {
      maxScores.set(axis, (maxScores.get(axis) || 0) + value);
    });
  });

  return maxScores;
}

function normalizeScores(rawScores, maxScores) {
  const normalized = {};

  for (const axis in rawScores) {
    const raw = rawScores[axis];
    const max = maxScores.get(axis) || 0;
    const min = -max;

    if (max > 0) {
      const range = max - min;
      normalized[axis] = 1 + ((raw - min) / range) * 9;
    } else {
      normalized[axis] = CENTER;
    }
  }

  return normalized;
}

function calculateCosineSimilarity(userScores, deckScores) {
  const weights = configData.weights || {};

  let dotProduct = 0;
  let userMagnitude = 0;
  let deckMagnitude = 0;

  AXES.forEach((axis) => {
    const weight = weights[axis] || 1;
    const userValue = (userScores[axis] - CENTER) * weight;
    const deckValue = (deckScores[axis] - CENTER) * weight;

    dotProduct += userValue * deckValue;
    userMagnitude += userValue * userValue;
    deckMagnitude += deckValue * deckValue;
  });

  const um = Math.sqrt(userMagnitude);
  const dm = Math.sqrt(deckMagnitude);
  if (um === 0 || dm === 0) return 0;

  return dotProduct / (um * dm);
}

function getRankedDecks(userScores, selectedTags = []) {
  let filteredDecks = decksData;

  if (selectedTags.length > 0 && !selectedTags.includes('상관없음')) {
    filteredDecks = decksData.filter((deck) => deck.tags.some((tag) => selectedTags.includes(tag)));
  }

  return filteredDecks
    .map((deck) => ({
      deck,
      similarity: calculateCosineSimilarity(userScores, deck.scores),
    }))
    .sort((a, b) => b.similarity - a.similarity);
}

function calculateScoresFromAnswers(answers, maxScores) {
  const rawScores = {
    stability: 0,
    difficulty: 0,
    ceiling: 0,
    tempo: 0,
    niche: 0,
    interaction: 0,
    power: 0,
  };

  answers.forEach((answer) => {
    answer.effects.forEach((effect) => {
      rawScores[effect.axis] += effect.value;
    });
  });

  return normalizeScores(rawScores, maxScores);
}

function printRanking(title, counts, sampleSize, limit = 23) {
  console.log(`\n=== ${title} ===\n`);
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);

  sorted.slice(0, limit).forEach(([name, count], idx) => {
    const pct = (count / sampleSize) * 100;
    const bar = '█'.repeat(Math.max(1, Math.round(pct / 2)));
    console.log(`${String(idx + 1).padStart(2)}. ${name.padEnd(20)} ${String(count).padStart(6)} (${pct.toFixed(2).padStart(6)}%) ${bar}`);
  });
}

console.log('=== 덱 추천 분포 분석 (Top 3 기준, 태그: 상관없음) ===\n');

const questions = questionsData;
const sampleSize = 50000;
const maxScores = calculateMaxScores(questions);

const top1Counts = {};
const top3InclusionCounts = {};
const top3SlotPoints = {};

const scoreSums = {
  stability: 0,
  difficulty: 0,
  ceiling: 0,
  tempo: 0,
  niche: 0,
  interaction: 0,
  power: 0,
};

console.log(`질문 개수: ${questions.length}`);
console.log(`각 질문 선택지 수: ${questions.map((q) => q.answers.length).join(', ')}`);
console.log(`샘플 수: ${sampleSize.toLocaleString()}`);
console.log('조건: 태그 선택 = "상관없음"\n');

for (let i = 0; i < sampleSize; i++) {
  if (i > 0 && i % 10000 === 0) {
    console.log(`진행: ${i.toLocaleString()} / ${sampleSize.toLocaleString()}`);
  }

  const randomAnswers = questions.map((q) => q.answers[Math.floor(Math.random() * q.answers.length)]);
  const scores = calculateScoresFromAnswers(randomAnswers, maxScores);

  AXES.forEach((axis) => {
    scoreSums[axis] += scores[axis];
  });

  const ranked = getRankedDecks(scores, ['상관없음']);
  if (ranked.length === 0) continue;

  const top1 = ranked[0].deck.name;
  top1Counts[top1] = (top1Counts[top1] || 0) + 1;

  const top3 = ranked.slice(0, 3);
  top3.forEach((item, index) => {
    const name = item.deck.name;
    top3InclusionCounts[name] = (top3InclusionCounts[name] || 0) + 1;

    const points = 3 - index; // 1위=3, 2위=2, 3위=1
    top3SlotPoints[name] = (top3SlotPoints[name] || 0) + points;
  });
}

console.log('\n=== 사용자 점수 평균 ===\n');
AXES.forEach((axis) => {
  console.log(`${axis.padEnd(15)}: ${(scoreSums[axis] / sampleSize).toFixed(2)}`);
});

printRanking('Top 1 점유율', top1Counts, sampleSize, decksData.length);
printRanking('Top 3 포함률 (Top3 안에 들기)', top3InclusionCounts, sampleSize, decksData.length);

const totalTop3Slots = sampleSize * 3;
const slotShareCounts = {};
Object.entries(top3InclusionCounts).forEach(([name, count]) => {
  slotShareCounts[name] = count;
});
printRanking('Top 3 슬롯 점유율 (총 3칸 기준)', slotShareCounts, totalTop3Slots, decksData.length);

const totalSlotPoints = sampleSize * 6; // (3+2+1)
console.log('\n=== Top 3 가중 점유율 (1위=3점, 2위=2점, 3위=1점) ===\n');
Object.entries(top3SlotPoints)
  .sort((a, b) => b[1] - a[1])
  .forEach(([name, points], idx) => {
    const pct = (points / totalSlotPoints) * 100;
    const bar = '█'.repeat(Math.max(1, Math.round(pct / 2)));
    console.log(`${String(idx + 1).padStart(2)}. ${name.padEnd(20)} ${String(points).padStart(6)}점 (${pct.toFixed(2).padStart(6)}%) ${bar}`);
  });

console.log('\n=== 요약 지표 ===\n');
const top1Sorted = Object.entries(top1Counts).sort((a, b) => b[1] - a[1]);
const top3InclSorted = Object.entries(top3InclusionCounts).sort((a, b) => b[1] - a[1]);

if (top1Sorted.length > 0) {
  console.log(`Top1 최대 점유: ${top1Sorted[0][0]} ${(top1Sorted[0][1] / sampleSize * 100).toFixed(2)}%`);
}
if (top3InclSorted.length > 0) {
  console.log(`Top3 포함 최대: ${top3InclSorted[0][0]} ${(top3InclSorted[0][1] / sampleSize * 100).toFixed(2)}%`);
}
console.log(`Top1 등장 덱 수: ${Object.keys(top1Counts).length} / ${decksData.length}`);
console.log(`Top3 등장 덱 수: ${Object.keys(top3InclusionCounts).length} / ${decksData.length}`);
console.log('\n=== 분석 완료 ===');
