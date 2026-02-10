// CSV를 JSON으로 변환하는 스크립트 (한글 헤더 지원)
import { readFileSync, writeFileSync } from 'fs';

const csv = readFileSync('./deck-scores.csv', 'utf-8');
const originalDecks = JSON.parse(readFileSync('./src/data/decks.json', 'utf-8'));

const lines = csv.trim().split('\n');

// 헤더 확인
const header = lines[0];
console.log('CSV 헤더:', header);
console.log('');

const decks = [];

for (let i = 1; i < lines.length; i++) {
  const line = lines[i];

  // CSV 파싱 (따옴표 처리)
  const matches = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g);
  if (!matches || matches.length < 10) {
    console.error('❌ 잘못된 라인:', line);
    continue;
  }

  const id = matches[0];
  const name = matches[1].replace(/"/g, '');
  const tagsStr = matches[2].replace(/"/g, '');

  // 원본 덱에서 description, commentary, image 가져오기
  const originalDeck = originalDecks.find(d => d.id === id);

  if (!originalDeck) {
    console.error('❌ 덱을 찾을 수 없음:', id);
    continue;
  }

  decks.push({
    id: id,
    name: name,
    description: originalDeck.description,
    commentary: originalDeck.commentary,
    image: originalDeck.image,
    tags: tagsStr.split(',').map(t => t.trim()).filter(t => t),
    scores: {
      stability: parseFloat(matches[3]),    // 안정성
      difficulty: parseFloat(matches[4]),   // 난이도
      ceiling: parseFloat(matches[5]),      // 고점
      tempo: parseFloat(matches[6]),        // 템포
      niche: parseFloat(matches[7]),        // 비주류
      interaction: parseFloat(matches[8]),  // 견제
      power: parseFloat(matches[9])         // 파워
    }
  });
}

// 백업 생성
const backup = './src/data/decks.json.backup';
writeFileSync(backup, JSON.stringify(originalDecks, null, 2), 'utf-8');
console.log('✅ 원본 백업 완료:', backup);

// 새 JSON 저장
writeFileSync('./src/data/decks.json', JSON.stringify(decks, null, 2), 'utf-8');
console.log('✅ decks.json 업데이트 완료!');
console.log('\n변경된 덱 수:', decks.length);
