import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const decksPath = join(process.cwd(), 'src', 'data', 'decks.json');

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function resolveOrigin(req) {
  const forwardedProto = String(req.headers['x-forwarded-proto'] || 'https').split(',')[0].trim();
  const forwardedHost = String(req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0].trim();
  return `${forwardedProto}://${forwardedHost}`;
}

function buildHtml({ title, description, imageUrl, pageUrl, redirectUrl }) {
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
  <meta property="og:image" content="${imageUrl}" />
  <meta property="og:url" content="${pageUrl}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${imageUrl}" />
  <meta http-equiv="refresh" content="0; url=${redirectUrl}" />
</head>
<body>
  <p>결과 페이지로 이동 중입니다...</p>
  <a href="${redirectUrl}">이동이 되지 않으면 클릭해 주세요.</a>
</body>
</html>
`;
}

export default function handler(req, res) {
  try {
    const decks = JSON.parse(readFileSync(decksPath, 'utf8'));
    const deckId = Array.isArray(req.query.deckId) ? req.query.deckId[0] : req.query.deckId;
    const deck = decks.find((item) => item.id === deckId);

    const origin = resolveOrigin(req);
    const score = Array.isArray(req.query.s) ? req.query.s[0] : req.query.s;
    const tags = Array.isArray(req.query.t) ? req.query.t[0] : req.query.t;

    const redirectUrl = new URL('/results', origin);
    if (score) redirectUrl.searchParams.set('s', score);
    if (tags) redirectUrl.searchParams.set('t', tags);

    const title = escapeHtml(
      `${deck?.name ?? '내 덱'} - 내 유희왕 1103 게이트볼 덱 성향 테스트 결과는?`
    );
    const description = '내 유희왕 1103 게이트볼 덱 성향 테스트 결과를 확인해보세요!';
    const imageUrl = escapeHtml(new URL(deck?.image || '/favicon.jpg', origin).toString());
    const pageUrl = escapeHtml(new URL(req.url || `/api/share/${deckId}`, origin).toString());

    const html = buildHtml({
      title,
      description: escapeHtml(description),
      imageUrl,
      pageUrl,
      redirectUrl: escapeHtml(redirectUrl.toString()),
    });

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(html);
  } catch (error) {
    res.status(500).json({ error: 'Failed to render share page', detail: String(error) });
  }
}

