import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
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

test('关注、推荐与五个教师任务域按确认顺序排列', async () => {
  const { default: DiscoverView } = await vite.ssrLoadModule('/src/views/DiscoverView.vue')
  const html = await renderToString(createSSRApp(DiscoverView))

  assert.match(html, /role="tablist" aria-label="灵感分类"/)
  assert.doesNotMatch(html, /aria-label="内容来源"|aria-label="教学场景"/)
  assert.match(html, />推荐<\/button>/)
  assert.match(html, />关注<\/button>/)
  assert.doesNotMatch(html, />全部<\/button>/)
  assert.match(html, />教学与备课<\/button>/)
  assert.match(html, />课堂与学情<\/button>/)
  assert.match(html, />作业与评价<\/button>/)
  assert.match(html, />班级与家校<\/button>/)
  assert.match(html, />教研与成长<\/button>/)
  const labels = ['关注', '推荐', '教学与备课', '课堂与学情', '作业与评价', '班级与家校', '教研与成长']
  const positions = labels.map((label) => html.indexOf(`>${label}</button>`))
  assert.ok(positions.every((position) => position >= 0))
  assert.deepEqual(positions, [...positions].sort((a, b) => a - b))
  assert.doesNotMatch(html, /aria-controls="discover-advanced-filters"|class="filter-toggle"/)
  assert.doesNotMatch(html, />筛选<\/button>/)

  const recommendButtonAttrs = html.match(/<button([^>]*)>\s*推荐\s*<\/button>/)?.[1] || ''
  assert.match(recommendButtonAttrs, /class="[^"]*\bon\b[^"]*"/)
  assert.match(recommendButtonAttrs, /role="tab"/)
  assert.match(recommendButtonAttrs, /aria-selected="true"/)
  assert.equal((html.match(/aria-selected="true"/g) || []).length, 1)
  assert.doesNotMatch(html, /id="discover-advanced-filters"/)
  assert.doesNotMatch(html, /aria-label="具体任务"/)
  assert.doesNotMatch(html, />语文<\/button>/)
  assert.doesNotMatch(html, />互动课件<\/button>/)
  assert.doesNotMatch(html, /class="mode-switch"|class="toolbar-divider"/)
  assert.doesNotMatch(html, /class="result-summary"|9 个灵感/)
})

test('发现页只用具体场景、学段和学科组织下钻筛选', () => {
  const source = readFileSync(new URL('../src/views/DiscoverView.vue', import.meta.url), 'utf8')

  assert.match(source, />具体场景</)
  assert.match(source, />学段</)
  assert.match(source, />学科</)
  assert.doesNotMatch(source, />内容类型</)
  assert.doesNotMatch(source, />内容形态</)
})

test('发现卡片只放大展示使用数，其他页默认指标不受影响', async () => {
  const { default: PostCard } = await vite.ssrLoadModule('/src/components/PostCard.vue')
  const post = {
    to: 'res', cover: '/cover.jpg', badge: '教案', title: '单元教案', meta: '小学数学',
    author: '沈知微', avatar: '沈', verify: 'expert', verified: false,
    evi: { use: '860', star: '2,330' },
  }
  const discoverHtml = await renderToString(createSSRApp(PostCard, { post, metricMode: 'use-only' }))
  const defaultHtml = await renderToString(createSSRApp(PostCard, { post }))

  assert.match(discoverHtml, /pc-metric--use-only/)
  assert.match(discoverHtml, />860<\/b><span[^>]*> 使用<\/span>/)
  assert.doesNotMatch(discoverHtml, /2,330|收藏/)
  assert.match(defaultHtml, /2,330/)
  assert.match(defaultHtml, /收藏/)
})

test('发现页精简卡片只保留标题和作者信息', async () => {
  const { default: PostCard } = await vite.ssrLoadModule('/src/components/PostCard.vue')
  const post = {
    to: 'res', cover: '/cover.jpg', badge: '教案', title: '单元教案', meta: '小学数学',
    author: '沈知微', avatar: '沈', verify: 'expert', verified: true,
    evi: { use: '860', star: '2,330' },
  }
  const compactHtml = await renderToString(createSSRApp(PostCard, { post, compact: true }))

  assert.match(compactHtml, /pc-title--2l[^>]*>单元教案</)
  assert.match(compactHtml, /沈知微/)
  assert.doesNotMatch(compactHtml, /pc-meta|小学数学|课堂验证/)
  assert.doesNotMatch(compactHtml, /pc-metric|860|使用/)
  assert.doesNotMatch(compactHtml, /pc-ck|M20 6L9 17l-5-5/)

  const source = readFileSync(new URL('../src/views/DiscoverView.vue', import.meta.url), 'utf8')
  assert.match(source, /<PostCard[^>]*\bcompact\b/)
})

test('发现页右上角只保留搜索框，不再重复展示学科学段选择器', async () => {
  const { default: DiscoverView } = await vite.ssrLoadModule('/src/views/DiscoverView.vue')
  const html = await renderToString(createSSRApp(DiscoverView))

  assert.match(html, /class="tbar-search"/)
  assert.doesNotMatch(html, /class="tbar-subj"/)
  assert.doesNotMatch(html, /切换学科·学段/)
})

test('发现页用一级导航与浅色展开区区分任务域和筛选', () => {
  const source = readFileSync(new URL('../src/views/DiscoverView.vue', import.meta.url), 'utf8')

  assert.match(source, /\.toolbar-primary\s*\{[^}]*min-height:68px/)
  assert.match(source, /\.primary-tabs\s*\{[^}]*overflow-x:auto/)
  assert.match(source, /\.primary-tab\s*\{[^}]*font-size:15px[^}]*font-weight:500/)
  assert.match(source, /\.primary-tab\.on\s*\{[^}]*font-weight:650/)
  assert.match(source, /\.primary-tab\.on::after/)
  assert.match(source, /\.filter-panel\s*\{[^}]*background:#FAFBFA/)
  assert.match(source, /\.filter-panel\s*\{[^}]*border-radius:14px/)
  assert.match(source, /\.task-button\s*\{[^}]*font-size:12px[^}]*font-weight:400[^}]*border-radius:8px/)
  assert.match(source, /\.task-button\.on\s*\{[^}]*font-weight:500/)
  assert.match(source, /\.facet-button\s*\{[^}]*font-size:12px[^}]*border-radius:8px/)
  assert.match(source, /\.facet-button\.on\s*\{[^}]*background:#EFEFEF/)
  assert.match(source, /\.discover-toolbar\s*\{[^}]*margin-bottom:20px/)
  assert.match(source, /\.advanced-filters\s*\{[^}]*padding:0/)
  assert.match(source, /\.facet-group\s*\{[^}]*display:flex[^}]*min-height:38px/)
  assert.doesNotMatch(source, /\.facet-group \+ \.facet-group/)
  assert.match(source, /\.facet-label\s*\{[^}]*width:72px/)
  assert.match(source, /\.facet-options\s*\{[^}]*gap:0/)
  assert.match(source, /\.facet-button\s*\{[^}]*margin:0 4px 10px 0/)
})

test('排行榜与发现共用社区框架，保留各自导航选中态', async () => {
  for (const [view, active] of [['DiscoverView', 'discover'], ['RankView', 'rank']]) {
    const { default: Component } = await vite.ssrLoadModule(`/src/views/${view}.vue`)
    const html = await renderToString(createSSRApp(Component))
    assert.match(html, /class="[^"]*community-main/)
    assert.match(html, /class="[^"]*community-body/)
    assert.match(html, new RegExp(`class="tbtab on nav-${active}"`))
    assert.match(html, /搜知识点、课型、课件、教案…/)
    const source = readFileSync(new URL(`../src/views/${view}.vue`, import.meta.url), 'utf8')
    assert.match(source, /import '\.\.\/styles\/community\.css'/)
    assert.doesNotMatch(source, /\.tbar-in\s*\{|background:#F7F7F7;.*container-type/)
  }
})

test('共用框架统一正文导航边界，卡片沿用侧栏可用空间切换列数', () => {
  const shared = readFileSync(new URL('../src/styles/community.css', import.meta.url), 'utf8')
  assert.match(shared, /\.community-body,\s*:is\(#view-discover, #view-rank, #view-skills\) \.tbar-in\s*\{[^}]*width:100% !important[^}]*max-width:1528px/)
  assert.match(shared, /padding-inline:clamp\(14px, 3cqi, 32px\) !important/)
  assert.match(shared, /background:#fff; container-type:inline-size; container-name:community/)
  for (const [width, columns] of [[720, 2], [1156, 3], [1528, 4]]) {
    assert.ok(shared.includes(`@container community (min-width:${width}px)`))
    assert.ok(shared.includes(`--community-columns:${columns}`))
  }
})
