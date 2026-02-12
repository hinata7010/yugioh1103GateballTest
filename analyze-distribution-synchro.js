// 덱 매칭 분포 분석 스크립트 (태그: 싱크로만)
import { readFileSync } from 'fs';

const questionsData = JSON.parse(readFileSync('./src/data/questions.json', 'utf-8'));
const decksData = JSON.parse(readFileSync('./src/data/decks.json', 'utf-8'));
const configData = JSON.parse(readFileSync('./src/data/config.json', 'utf-8'));

// 점수 계산 함수들
function calculateMaxScores(questions) {
  const maxScores = new Map();

  questions.forEach(question => {
    const questionMaxPerAxis = new Map();

    question.answers.forEach(answer => {
      answer.effects.forEach(effect => {
        const current = questionMaxPerAxis.get(effect.axis) || 0;
        if (effect.value > 0 && effect.value > current) {
          questionMaxPerAxis.set(effect.axis, effect.value);
        }
      });
    });

    questionMaxPerAxis.forEach((value, axis) => {
      const total = maxScores.get(axis) || 0;
      maxScores.set(axis, total + value);
    });
  });

  return maxScores;
}

function normalizeScores(rawScores, maxScores) {
  const normalized = {};

  for (const axis in rawScores) {
    const raw = rawScores[axis];
    const max = maxScores.get(axis) || 0;
    const min = -(maxScores.get(axis) || 0);

    // 1~10 범위로 정규화 (scoring.ts와 동일)
    // min점 = 1, 0점 = 5.5, max점 = 10
    if (max > 0) {
      const range = max - min;
      normalized[axis] = 1 + ((raw - min) / range) * 9;
    } else {
      normalized[axis] = 5.5; // 기본값 (중간)
    }
  }

  return normalized;
}

function calculateCosineSimilarity(userScores, deckScores) {
  const axes = ['stability', 'difficulty', 'ceiling', 'tempo', 'niche', 'interaction', 'power'];
  const weights = configData.weights;
  const CENTER = 5.5; // 1~10 범위의 중간값

  let dotProduct = 0;
  let userMagnitude = 0;
  let deckMagnitude = 0;

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

  if (userMagnitude === 0 || deckMagnitude === 0) {
    return 0;
  }

  return dotProduct / (userMagnitude * deckMagnitude);
}

function findTopMatch(userScores, selectedTags = []) {
  // 태그 필터링
  let filteredDecks = decksData;

  if (selectedTags.length > 0 && !selectedTags.includes('상관없음')) {
    filteredDecks = decksData.filter(deck => {
      return deck.tags.some(tag => selectedTags.includes(tag));
    });
  }

  if (filteredDecks.length === 0) {
    return null;
  }

  let maxSimilarity = -Infinity;
  let topDeck = null;

  filteredDecks.forEach(deck => {
    const similarity = calculateCosineSimilarity(userScores, deck.scores);
    if (similarity > maxSimilarity) {
      maxSimilarity = similarity;
      topDeck = deck;
    }
  });

  return topDeck;
}

// 점수 계산
function calculateScoresFromAnswers(answers, maxScores) {
  const rawScores = {
    stability: 0,
    difficulty: 0,
    ceiling: 0,
    tempo: 0,
    niche: 0,
    interaction: 0,
    power: 0
  };

  answers.forEach(answer => {
    answer.effects.forEach(effect => {
      rawScores[effect.axis] += effect.value;
    });
  });

  return normalizeScores(rawScores, maxScores);
}

// 메인 분석
console.log('=== 덱 매칭 분포 분석 (태그: 싱크로만) ===\n');

const questions = questionsData;
const totalQuestions = questions.length;
const answerCounts = questions.map(q => q.answers.length);
const totalCombinations = answerCounts.reduce((acc, count) => acc * count, 1);

console.log(`질문 개수: ${totalQuestions}`);
console.log(`각 질문의 선택지 개수: ${answerCounts.join(', ')}`);
console.log(`총 경우의 수: ${totalCombinations.toLocaleString()}`);
console.log(`조건: 태그 선택 = "싱크로"만 고려\n`);

// 싱크로 태그를 가진 덱 목록
const synchroDecks = decksData.filter(deck => deck.tags.includes('싱크로'));
console.log('싱크로 태그를 가진 덱:');
synchroDecks.forEach(deck => {
  console.log(`  - ${deck.name} (tags: ${deck.tags.join(', ')})`);
});
console.log();

// 랜덤 샘플링
const deckCounts = {};
const sampleSize = 50000; // 더 많은 샘플로 정확도 향상
const maxScores = calculateMaxScores(questions);

// 사용자 점수 누적 (평균 계산용)
const userScoreSum = {
  stability: 0, difficulty: 0, ceiling: 0, tempo: 0,
  niche: 0, interaction: 0, power: 0
};

console.log(`샘플링 중... (${sampleSize.toLocaleString()}개)\n`);

for (let i = 0; i < sampleSize; i++) {
  if (i % 10000 === 0 && i > 0) {
    console.log(`진행: ${i.toLocaleString()} / ${sampleSize.toLocaleString()}`);
  }

  const randomAnswers = questions.map(q => {
    const randomIndex = Math.floor(Math.random() * q.answers.length);
    return q.answers[randomIndex];
  });

  const scores = calculateScoresFromAnswers(randomAnswers, maxScores);

  // 사용자 점수 누적
  Object.keys(scores).forEach(axis => {
    userScoreSum[axis] += scores[axis];
  });

  // 태그는 항상 "싱크로"
  const selectedTags = ['싱크로'];

  const topDeck = findTopMatch(scores, selectedTags);

  if (topDeck) {
    deckCounts[topDeck.name] = (deckCounts[topDeck.name] || 0) + 1;
  }
}

// 사용자 점수 평균 계산
console.log('\n=== 사용자 점수 평균 ===\n');
const axes = ['stability', 'difficulty', 'ceiling', 'tempo', 'niche', 'interaction', 'power'];
axes.forEach(axis => {
  const avg = userScoreSum[axis] / sampleSize;
  console.log(`${axis.padEnd(15)}: ${avg.toFixed(2)}`);
});
console.log();

console.log(`=== 샘플링 결과 (${sampleSize.toLocaleString()}개, 태그: 싱크로) ===\n`);
const sorted = Object.entries(deckCounts).sort((a, b) => b[1] - a[1]);

sorted.forEach(([name, count], index) => {
  const percentage = (count / sampleSize * 100).toFixed(2);
  const bar = '█'.repeat(Math.round(percentage / 2));

  // 개구리제왕 강조
  const highlight = name === '개구리제왕' ? ' 🐸👑' : '';

  console.log(`${(index + 1).toString().padStart(2)}. ${name.padEnd(20)} ${count.toString().padStart(6)} (${percentage.padStart(6)}%) ${bar}${highlight}`);
});

console.log(`\n매칭되는 덱 종류: ${sorted.length} / ${synchroDecks.length}개 (싱크로 태그 덱)`);

// 개구리제왕 확인
const frogMonarch = sorted.find(([name]) => name === '개구리제왕');
if (frogMonarch) {
  const [name, count] = frogMonarch;
  const percentage = (count / sampleSize * 100).toFixed(2);
  const rank = sorted.findIndex(([n]) => n === name) + 1;

  console.log('\n=== 🐸 개구리제왕 상세 분석 ===\n');
  console.log(`순위: ${rank}위 / ${sorted.length}개`);
  console.log(`출현 횟수: ${count} / ${sampleSize.toLocaleString()}`);
  console.log(`확률: ${percentage}%`);
  console.log(`역수: 약 ${Math.round(sampleSize / count)}번 중 1번`);
} else {
  console.log('\n=== 🐸 개구리제왕 상세 분석 ===\n');
  console.log('❌ 개구리제왕은 싱크로 태그를 가지고 있지 않아 필터링되었습니다!');
  console.log('   싱크로 선택 시 개구리제왕 확률: 0%');
}

console.log('\n=== 분석 완료 ===');
