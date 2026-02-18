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
  const description = '내 유희왕 1103 게이트볼 덱 성향 테스트 결과를 확인해보세요!';
  const image = escapeHtml(deck.image || '/favicon.jpg');
  const pagePath = `/share/${encodeURIComponent(deck.id)}.html`;

  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:url" content="${pagePath}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${image}" />
</head>
<body>
  <p>결과 페이지로 이동 중입니다...</p>
  <script>
    (function () {
      const current = new URL(window.location.href);
      const target = new URL('/results', window.location.origin);
      const score = current.searchParams.get('s');
      const tags = current.searchParams.get('t');
      if (score) target.searchParams.set('s', score);
      if (tags) target.searchParams.set('t', tags);
      window.location.replace(target.toString());
    })();
  </script>
</body>
</html>
`;
}

function main() {
  const decks = JSON.parse(readFileSync(decksPath, 'utf8'));

  rmSync(outputDir, { recursive: true, force: true });
  mkdirSync(outputDir, { recursive: true });

  for (const deck of decks) {
    if (!deck?.id) continue;
    const filePath = join(outputDir, `${deck.id}.html`);
    writeFileSync(filePath, buildHtml(deck), 'utf8');
  }

  const genericHtml = `<!doctype html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>내 유희왕 1103 게이트볼 덱 성향 테스트 결과는?</title>
  <meta name="description" content="내 유희왕 1103 게이트볼 덱 성향 테스트 결과를 확인해보세요!" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="내 유희왕 1103 게이트볼 덱 성향 테스트 결과는?" />
  <meta property="og:description" content="내 유희왕 1103 게이트볼 덱 성향 테스트 결과를 확인해보세요!" />
  <meta property="og:image" content="/favicon.jpg" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="내 유희왕 1103 게이트볼 덱 성향 테스트 결과는?" />
  <meta name="twitter:description" content="내 유희왕 1103 게이트볼 덱 성향 테스트 결과를 확인해보세요!" />
  <meta name="twitter:image" content="/favicon.jpg" />
</head>
<body>
  <script>
    (function () {
      const current = new URL(window.location.href);
      const target = new URL('/results', window.location.origin);
      const score = current.searchParams.get('s');
      const tags = current.searchParams.get('t');
      if (score) target.searchParams.set('s', score);
      if (tags) target.searchParams.set('t', tags);
      window.location.replace(target.toString());
    })();
  </script>
</body>
</html>
`;
  writeFileSync(join(outputDir, 'index.html'), genericHtml, 'utf8');

  console.log(`generated ${decks.length} share pages in public/share`);
}

main();
