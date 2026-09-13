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

test('只有三个内容榜各自提供学科下拉，不在页面顶部或创作者榜重复出现', async () => {
  const { default: RankView } = await loadModule('/src/views/RankView.vue')
  const html = await renderToString(createSSRApp(RankView))

  const editorialIndex = html.indexOf('aria-label="编辑推荐"')
  const classroomIndex = html.indexOf('aria-label="课堂使用榜"')
  const hotIndex = html.indexOf('aria-label="每周热门"')
  const remixIndex = html.indexOf('aria-label="优质改编"')
  const recognizedIndex = html.indexOf('aria-label="创作达人榜"')
  const risingIndex = html.indexOf('aria-label="新锐创作者榜"')

  const editorialSection = html.slice(editorialIndex, classroomIndex)
  const classroomSection = html.slice(classroomIndex, hotIndex)
  const hotSection = html.slice(hotIndex, remixIndex)
  const remixSection = html.slice(remixIndex, recognizedIndex)
  const recognizedSection = html.slice(recognizedIndex, risingIndex)
  const risingSection = html.slice(risingIndex)

  assert.ok(editorialIndex >= 0)
  assert.equal((html.match(/<select\b/g) || []).length, 3)
  assert.match(classroomSection, /aria-label="课堂使用榜学科选择"/)
  assert.match(hotSection, /aria-label="每周热门学科选择"/)
  assert.match(remixSection, /aria-label="优质改编学科选择"/)
  assert.doesNotMatch(editorialSection, /<select\b|榜单学科/)
  assert.doesNotMatch(recognizedSection, /<select\b/)
  assert.doesNotMatch(risingSection, /<select\b/)
  assert.match(classroomSection, /aria-label="周期"/)
})

test('编辑推荐保持固定精选，不跟随内容榜学科变化', async () => {
  const [{ default: RankView }, { EDITORIAL_FEATURES }] = await Promise.all([
    loadModule('/src/views/RankView.vue'),
    loadModule('/src/data/rank.js'),
  ])
  const html = await renderToString(createSSRApp(RankView))
  const editorialSection = html.slice(
    html.indexOf('aria-label="编辑推荐"'),
    html.indexOf('aria-label="课堂使用榜"'),
  )

  assert.equal(EDITORIAL_FEATURES.length, 2)
  assert.match(editorialSection, /《出师表》行军决策图/)
  assert.match(editorialSection, /古诗词证据卡 · 课堂版/)
  assert.doesNotMatch(editorialSection, /<select\b/)
})

test('榜单卡按各自学科选择收敛内容，没有该学科条目时给出明确空状态', async () => {
  const [{ default: RankBoardCard }, { BOARDS }] = await Promise.all([
    loadModule('/src/components/RankBoardCard.vue'),
    loadModule('/src/data/rank.js'),
  ])
  const latest = BOARDS.find((item) => item.key === 'latest')
  const classroom = BOARDS.find((item) => item.key === 'classroom')

  const chineseHtml = await renderToString(createSSRApp(RankBoardCard, { board: latest, variant: 'grid', subject: '语文' }))
  const emptyHtml = await renderToString(createSSRApp(RankBoardCard, { board: classroom, variant: 'main', subject: '英语' }))

  assert.equal((chineseHtml.match(/rank-grid-card/g) || []).length, 2)
  assert.match(chineseHtml, /古诗词证据卡 · 课堂版/)
  assert.match(chineseHtml, /祥林嫂剧本杀/)
  assert.doesNotMatch(chineseHtml, /英语听说·全班开口课/)
  assert.match(emptyHtml, /英语学科暂未上榜/)
  assert.doesNotMatch(emptyHtml, /rank-podium-card|rank-list-row/)
})

test('编辑推荐只展示作品卡，不再把创作者本人作为推荐对象', async () => {
  const { EDITORIAL_FEATURES } = await loadModule('/src/data/rank.js')

  assert.equal(EDITORIAL_FEATURES.length, 2)
  for (const feature of EDITORIAL_FEATURES) {
    assert.equal(feature.target, 'resource', feature.key)
    assert.match(feature.resourceId, /^res-/, feature.key)
    assert.notEqual(feature.title, feature.author, feature.key)
  }

  assert.equal(EDITORIAL_FEATURES[1].eyebrow, '课堂工具精选')
  assert.equal(EDITORIAL_FEATURES[1].title, '古诗词证据卡 · 课堂版')
  assert.equal(EDITORIAL_FEATURES[1].author, '刘彭芝')
  assert.equal(EDITORIAL_FEATURES[1].metric, '980')
})
