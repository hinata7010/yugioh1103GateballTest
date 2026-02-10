// 덱 매칭 분포 분석 스크립트
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

// 모든 조합 생성 (재귀)
function generateAllCombinations(questions, index = 0, currentAnswers = []) {
  if (index === questions.length) {
    return [currentAnswers];
  }

  const question = questions[index];
  const allCombinations = [];

  question.answers.forEach(answer => {
    const combinations = generateAllCombinations(
      questions,
      index + 1,
      [...currentAnswers, answer]
    );
    allCombinations.push(...combinations);
  });

  return allCombinations;
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
console.log('=== 덱 매칭 분포 분석 ===\n');

const questions = questionsData;
const totalQuestions = questions.length;
const answerCounts = questions.map(q => q.answers.length);
const totalCombinations = answerCounts.reduce((acc, count) => acc * count, 1);

console.log(`질문 개수: ${totalQuestions}`);
console.log(`각 질문의 선택지 개수: ${answerCounts.join(', ')}`);
console.log(`총 경우의 수: ${totalCombinations.toLocaleString()}\n`);

if (totalCombinations > 100000) {
  console.log('⚠️  경우의 수가 너무 많아 샘플링합니다 (10,000개)...\n');

  // 랜덤 샘플링
  const deckCounts = {};
  const sampleSize = 10000;
  const maxScores = calculateMaxScores(questions);

  // 사용자 점수 누적 (평균 계산용)
  const userScoreSum = {
    stability: 0, difficulty: 0, ceiling: 0, tempo: 0,
    niche: 0, interaction: 0, power: 0
  };

  // 가능한 태그들
  const availableTags = ['싱크로', '엑시즈', '융합', '의식', '상관없음'];
  const tagSelectionCounts = {
    '상관없음': 0,
    '싱크로': 0,
    '엑시즈': 0,
    '융합': 0,
    '의식': 0,
    '복수선택': 0
  };

  for (let i = 0; i < sampleSize; i++) {
    const randomAnswers = questions.map(q => {
      const randomIndex = Math.floor(Math.random() * q.answers.length);
      return q.answers[randomIndex];
    });

    const scores = calculateScoresFromAnswers(randomAnswers, maxScores);

    // 사용자 점수 누적
    Object.keys(scores).forEach(axis => {
      userScoreSum[axis] += scores[axis];
    });

    // 랜덤하게 태그 선택 (실제 사용자 행동 시뮬레이션)
    let selectedTags = [];
    const tagChoice = Math.random();

    if (tagChoice < 0.3) {
      // 30% - 상관없음
      selectedTags = ['상관없음'];
      tagSelectionCounts['상관없음']++;
    } else if (tagChoice < 0.6) {
      // 30% - 1개 선택
      const randomTag = availableTags[Math.floor(Math.random() * 4)]; // 상관없음 제외
      selectedTags = [randomTag];
      tagSelectionCounts[randomTag]++;
    } else {
      // 40% - 2개 선택
      const shuffled = [...availableTags.slice(0, 4)].sort(() => Math.random() - 0.5);
      selectedTags = shuffled.slice(0, 2);
      tagSelectionCounts['복수선택']++;
    }

    const topDeck = findTopMatch(scores, selectedTags);

    if (topDeck) {
      deckCounts[topDeck.name] = (deckCounts[topDeck.name] || 0) + 1;
    }
  }

  // 태그 선택 통계 출력
  console.log('=== 태그 선택 통계 ===\n');
  Object.entries(tagSelectionCounts).forEach(([tag, count]) => {
    const percentage = (count / sampleSize * 100).toFixed(1);
    console.log(`${tag.padEnd(15)}: ${count.toString().padStart(5)} (${percentage}%)`);
  });
  console.log();

  // 사용자 점수 평균 계산
  console.log('=== 사용자 점수 평균 (10,000개 샘플) ===\n');
  const axes = ['stability', 'difficulty', 'ceiling', 'tempo', 'niche', 'interaction', 'power'];
  axes.forEach(axis => {
    const avg = userScoreSum[axis] / sampleSize;
    console.log(`${axis.padEnd(15)}: ${avg.toFixed(2)}`);
  });
  console.log();

  console.log('=== 샘플링 결과 (10,000개) ===\n');
  const sorted = Object.entries(deckCounts).sort((a, b) => b[1] - a[1]);

  sorted.forEach(([name, count], index) => {
    const percentage = (count / sampleSize * 100).toFixed(2);
    const bar = '█'.repeat(Math.round(percentage / 2));
    console.log(`${(index + 1).toString().padStart(2)}. ${name.padEnd(20)} ${count.toString().padStart(5)} (${percentage.padStart(6)}%) ${bar}`);
  });

} else {
  console.log('모든 경우의 수를 계산합니다...\n');

  const allCombinations = generateAllCombinations(questions);
  const maxScores = calculateMaxScores(questions);
  const deckCounts = {};

  allCombinations.forEach((answers, index) => {
    if (index % 1000 === 0) {
      process.stdout.write(`\r진행: ${index}/${totalCombinations}`);
    }

    const scores = calculateScoresFromAnswers(answers, maxScores);
    const topDeck = findTopMatch(scores);

    if (topDeck) {
      deckCounts[topDeck.name] = (deckCounts[topDeck.name] || 0) + 1;
    }
  });

  console.log('\n\n=== 전체 분석 결과 ===\n');
  const sorted = Object.entries(deckCounts).sort((a, b) => b[1] - a[1]);

  sorted.forEach(([name, count], index) => {
    const percentage = (count / totalCombinations * 100).toFixed(2);
    const bar = '█'.repeat(Math.round(percentage / 2));
    console.log(`${(index + 1).toString().padStart(2)}. ${name.padEnd(20)} ${count.toString().padStart(7)} (${percentage.padStart(6)}%) ${bar}`);
  });

  console.log(`\n매칭되는 덱 종류: ${sorted.length} / ${decksData.length}`);
  console.log(`매칭 안 되는 덱: ${decksData.length - sorted.length}개`);

  if (sorted.length < decksData.length) {
    const matchedNames = new Set(sorted.map(([name]) => name));
    const unmatchedDecks = decksData.filter(d => !matchedNames.has(d.name));
    console.log('\n매칭 안 되는 덱 목록:');
    unmatchedDecks.forEach(d => console.log(`  - ${d.name}`));
  }
}

console.log('\n=== 분석 완료 ===');
