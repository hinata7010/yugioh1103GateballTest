import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const decksPath = join(__dirname, 'src', 'data', 'decks.json')

function escapeHtml(value: string) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function shareApiDevPlugin() {
  return {
    name: 'share-api-dev',
    apply: 'serve' as const,
    configureServer(server: any) {
      server.middlewares.use('/api/share', (req: any, res: any, next: any) => {
        if (!req.url) return next()
        const incoming = new URL(req.url, 'http://localhost')
        const parts = incoming.pathname.split('/').filter(Boolean)
        const deckId = decodeURIComponent(parts[parts.length - 1] || '')
        if (!deckId) return next()

        const decks = JSON.parse(readFileSync(decksPath, 'utf8'))
        const deck = decks.find((item: any) => item.id === deckId)
        if (!deck) {
          res.statusCode = 404
          res.end('Deck not found')
          return
        }

        const host = req.headers.host || 'localhost:5173'
        const origin = `http://${host}`
        const score = incoming.searchParams.get('s')
        const tags = incoming.searchParams.get('t')
        const redirectUrl = new URL('/results', origin)
        if (score) redirectUrl.searchParams.set('s', score)
        if (tags) redirectUrl.searchParams.set('t', tags)

        const deckName = deck.name
        const title = escapeHtml(`${deckName} - 내 유희왕 1103 게이트볼 덱 성향 테스트 결과는?`)
        const description = escapeHtml(
          `내 유희왕 1103 게이트볼 덱 성향 테스트 결과는 ${deckName}! 당신도 테스트하고 덱 추천 받아보세요.`
        )
        const imageUrl = escapeHtml(new URL(deck.image || '/favicon.jpg', origin).toString())
        const pageUrl = escapeHtml(new URL(`/api/share/${encodeURIComponent(deckId)}`, origin).toString())
        const redirect = escapeHtml(redirectUrl.toString())

        const html = `<!doctype html>
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
  <meta http-equiv="refresh" content="0; url=${redirect}" />
</head>
<body>
  <p>결과 페이지로 이동 중입니다...</p>
  <a href="${redirect}">이동되지 않으면 여기를 눌러 주세요</a>
</body>
</html>`

        res.statusCode = 200
        res.setHeader('Content-Type', 'text/html; charset=utf-8')
        res.end(html)
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), shareApiDevPlugin()],
})
