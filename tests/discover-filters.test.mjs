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

test('推荐关注和教学场景合并为一排，推荐默认不展示下钻筛选', async () => {
  const { default: DiscoverView } = await vite.ssrLoadModule('/src/views/DiscoverView.vue')
  const html = await renderToString(createSSRApp(DiscoverView))

  assert.match(html, /role="tablist" aria-label="灵感分类"/)
  assert.doesNotMatch(html, /aria-label="内容来源"|aria-label="教学场景"/)
  assert.match(html, />推荐<\/button>/)
  assert.match(html, />关注<\/button>/)
  assert.doesNotMatch(html, />全部<\/button>/)
  assert.match(html, />备课<\/button>/)
  assert.match(html, />上课<\/button>/)
  assert.match(html, />作业与评价<\/button>/)
  assert.match(html, />教研成长<\/button>/)
  assert.doesNotMatch(html, />班级管理<\/button>/)
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

test('发现页右上角只保留搜索框，不再重复展示学科学段选择器', async () => {
  const { default: DiscoverView } = await vite.ssrLoadModule('/src/views/DiscoverView.vue')
  const html = await renderToString(createSSRApp(DiscoverView))

  assert.match(html, /class="tbar-search"/)
  assert.doesNotMatch(html, /class="tbar-subj"/)
  assert.doesNotMatch(html, /切换学科·学段/)
})

test('发现页在桌面端使用三列卡片并对齐正式页筛选密度', () => {
  const source = readFileSync(new URL('../src/views/DiscoverView.vue', import.meta.url), 'utf8')

  assert.match(source, /\.discover-body\s*\{[^}]*padding:30px 70px 56px/)
  assert.match(source, /\.tbar\s+\.tbtab\s*\{[^}]*font-size:16px[^}]*font-weight:400/)
  assert.match(source, /\.tbar\s+\.tbtab\.on\s*\{[^}]*font-weight:500/)
  assert.match(source, /\.toolbar-primary\s*\{[^}]*min-height:60px/)
  assert.match(source, /\.primary-tabs\s*\{[^}]*gap:42px/)
  assert.match(source, /\.primary-tab\s*\{[^}]*font-size:14px[^}]*font-weight:500/)
  assert.match(source, /\.primary-tab\.on\s*\{[^}]*font-weight:500/)
  assert.doesNotMatch(source, /\.primary-tab\.on::after/)
  assert.match(source, /\.task-button\s*\{[^}]*font-size:12px[^}]*font-weight:400[^}]*border-radius:8px/)
  assert.match(source, /\.task-button\.on\s*\{[^}]*font-weight:500/)
  assert.match(source, /\.facet-button\s*\{[^}]*font-size:12px[^}]*border-radius:8px/)
  assert.match(source, /\.facet-button\.on\s*\{[^}]*background:#EFEFEF/)
  assert.match(source, /\.discover-toolbar\s*\{[^}]*margin-bottom:20px/)
  assert.match(source, /\.advanced-filters\s*\{[^}]*margin-top:0[^}]*padding:4px 0 6px[^}]*border:0/)
  assert.match(source, /\.facet-group\s*\{[^}]*display:flex[^}]*min-height:38px[^}]*padding:0/)
  assert.doesNotMatch(source, /\.facet-group \+ \.facet-group/)
  assert.match(source, /\.facet-label\s*\{[^}]*width:auto[^}]*margin:6px 4px 0 0/)
  assert.match(source, /\.facet-options\s*\{[^}]*gap:0/)
  assert.match(source, /\.facet-button\s*\{[^}]*margin:0 4px 10px 0/)
  assert.match(source, /\.flow\s*\{[^}]*grid-template-columns:repeat\(3, minmax\(0, 1fr\)\)/)
  assert.match(source, /@media \(max-width:1180px\)[\s\S]*?\.flow\s*\{\s*grid-template-columns:repeat\(2, minmax\(0, 1fr\)\)/)
  assert.match(source, /@media \(max-width:620px\)[\s\S]*?\.flow\s*\{\s*grid-template-columns:1fr/)
})

test('排行榜与发现使用相同的顶部导航规格', () => {
  const rankSource = readFileSync(new URL('../src/views/RankView.vue', import.meta.url), 'utf8')

  assert.match(rankSource, /\.tbar\s*\{[^}]*height:54px[^}]*padding:0 70px/)
  assert.match(rankSource, /\.tbar-in\s*\{[^}]*width:calc\(100% - 140px\) !important[^}]*max-width:none/)
  assert.match(rankSource, /\.tbar-tabs\s*\{[^}]*gap:26px/)
  assert.match(rankSource, /\.tbar \.tbtab\s*\{[^}]*color:#7A7C7C[^}]*font-size:16px[^}]*font-weight:400/)
  assert.match(rankSource, /\.tbar \.tbtab\.on\s*\{[^}]*color:#141F1B[^}]*font-weight:500/)
  assert.match(rankSource, /\.tbar-search\s*\{[^}]*flex:0 0 260px[^}]*width:260px/)
})

test('排行榜正文与发现页使用相同的响应式左右边距', () => {
  const rankSource = readFileSync(new URL('../src/views/RankView.vue', import.meta.url), 'utf8')

  assert.match(rankSource, /#view-rank \.rank-shell\s*\{[^}]*width:min\(100%, 1320px\)[^}]*padding:24px 70px 64px !important[^}]*box-sizing:border-box/)
  assert.doesNotMatch(rankSource, /@media \(max-width:1300px\)[^{]*\{[^}]*\.rank-shell/)
  assert.match(rankSource, /@media \(max-width:820px\)[\s\S]*?#view-rank \.rank-shell\s*\{[^}]*padding-left:20px !important[^}]*padding-right:20px !important/)
  assert.match(rankSource, /@media \(max-width:620px\)[\s\S]*?#view-rank \.rank-shell\s*\{[^}]*padding-left:14px !important[^}]*padding-right:14px !important/)
})
