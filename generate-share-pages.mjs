import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const decksPath = join(process.cwd(), 'src', 'data', 'decks.json');
const outputDir = join(process.cwd(), 'public', 'share');

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function buildHtml(deck) {
  const deckName = escapeHtml(deck.name);
  const title = `${deckName} - 내 유희왕 1103 게이트볼 덱 성향 테스트 결과는?`;
  const description = `내 유희왕 1103 게이트볼 덱 성향 테스트 결과는 ${deckName}! 당신도 테스트하고 덱 추천 받아보세요.`;
  const imagePath = escapeHtml(deck.image || '/favicon.jpg');

  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:image" content="${imagePath}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${imagePath}" />
</head>
<body>
  <p>결과 페이지로 이동 중입니다...</p>
  <script>
    (function () {
      var current = new URL(window.location.href);
      var target = new URL('/results', window.location.origin);
      var score = current.searchParams.get('s');
      var tags = current.searchParams.get('t');
      if (score) target.searchParams.set('s', score);
      if (tags) target.searchParams.set('t', tags);
      window.location.replace(target.toString());
    })();
  </script>
</body>
</html>`;
}

const decks = JSON.parse(readFileSync(decksPath, 'utf8'));
rmSync(outputDir, { recursive: true, force: true });
mkdirSync(outputDir, { recursive: true });

for (const deck of decks) {
  if (!deck?.id) continue;
  writeFileSync(join(outputDir, `${deck.id}.html`), buildHtml(deck), 'utf8');
}

writeFileSync(
  join(outputDir, 'index.html'),
  '<!doctype html><html><head><meta charset="UTF-8"><meta http-equiv="refresh" content="0;url=/"></head><body></body></html>',
  'utf8'
);

console.log(`[share-pages] generated ${decks.length} static share pages`);
