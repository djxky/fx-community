import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'

import { createSSRApp } from 'vue'
import { renderToString } from '@vue/server-renderer'

let vite

before(async () => {
  process.env.VITE_CJS_IGNORE_WARNING = 'true'
  const { createServer } = await import('vite')
  vite = await createServer({
    appType: 'custom',
    logLevel: 'silent',
    server: { middlewareMode: true },
  })
})

after(async () => {
  await vite.close()
})

async function loadModule(path) {
  return vite.ssrLoadModule(path)
}

test('创作达人榜和新锐创作者榜每个名次都有可打开的代表作', async () => {
  const { BOARDS } = await loadModule('/src/data/rank.js')

  for (const key of ['recognized', 'rising']) {
    const board = BOARDS.find((item) => item.key === key)

    assert.equal(board.items.length, 10, key)
    for (const item of board.items) {
      assert.ok(item.workTitle, `${key}: ${item.name} workTitle`)
      assert.ok(item.cover, `${key}: ${item.name} cover`)
      assert.match(item.resourceId, /^res-/, `${key}: ${item.name} resourceId`)
    }
  }
})

test('课堂使用榜和创作达人榜的两列列表都保留 6 项，不产生悬空卡片', async () => {
  const [{ default: RankBoardCard }, { BOARDS }] = await Promise.all([
    loadModule('/src/components/RankBoardCard.vue'),
    loadModule('/src/data/rank.js'),
  ])
  const classroom = BOARDS.find((item) => item.key === 'classroom')
  const recognized = BOARDS.find((item) => item.key === 'recognized')

  const classroomHtml = await renderToString(createSSRApp(RankBoardCard, { board: classroom, variant: 'main' }))
  const recognizedHtml = await renderToString(createSSRApp(RankBoardCard, { board: recognized, variant: 'main' }))

  assert.equal((classroomHtml.match(/rank-podium-card/g) || []).length, 3)
  assert.equal((classroomHtml.match(/rank-list-row/g) || []).length, 6)
  assert.equal((recognizedHtml.match(/rank-podium-card/g) || []).length, 3)
  assert.equal((recognizedHtml.match(/rank-list-row/g) || []).length, 6)
  assert.match(recognizedHtml, /立体几何·生活建模/)
  assert.match(recognizedHtml, /沈知微/)
  assert.doesNotMatch(recognizedHtml, /creator-work-card/)
  assert.doesNotMatch(recognizedHtml, /nav-studio/)
})

test('新锐创作者榜复用每周热门网格并展示 8 项', async () => {
  const [{ default: RankBoardCard }, { BOARDS }] = await Promise.all([
    loadModule('/src/components/RankBoardCard.vue'),
    loadModule('/src/data/rank.js'),
  ])
  const rising = BOARDS.find((item) => item.key === 'rising')
  const risingHtml = await renderToString(createSSRApp(RankBoardCard, { board: rising, variant: 'grid' }))

  assert.equal((risingHtml.match(/rank-grid-card/g) || []).length, 8)
  assert.match(risingHtml, /祥林嫂 · 县中简化版/)
  assert.match(risingHtml, /周涛/)
  assert.doesNotMatch(risingHtml, /creator-work-rail/)
  assert.doesNotMatch(risingHtml, /nav-studio/)
})

test('创作达人榜与新锐创作者榜在排行榜中同时平铺展示', async () => {
  const { default: RankView } = await loadModule('/src/views/RankView.vue')
  const html = await renderToString(createSSRApp(RankView))

  assert.match(html, /<section[^>]+aria-label="创作达人榜"/)
  assert.match(html, /<section[^>]+aria-label="新锐创作者榜"/)
  assert.match(html, /rank-recognized-board/)
  assert.match(html, /rank-rising-board/)
  assert.ok(html.indexOf('rank-recognized-board') < html.indexOf('rank-rising-board'))
  assert.doesNotMatch(html, /aria-label="创作者榜单"/)
})

test('排行榜不再显示全局学科筛选，周期筛选仍保留', async () => {
  const { default: RankView } = await loadModule('/src/views/RankView.vue')
  const html = await renderToString(createSSRApp(RankView))

  assert.doesNotMatch(html, /aria-label="学科"/)
  assert.doesNotMatch(html, /rank-subbar/)
  assert.match(html, /aria-label="周期"/)
  assert.match(html, />本周<\/button>/)
  assert.match(html, />本月<\/button>/)
  assert.match(html, />年度<\/button>/)
})
