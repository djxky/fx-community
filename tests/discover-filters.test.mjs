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

test('发现页保持正式页筛选密度', () => {
  const source = readFileSync(new URL('../src/views/DiscoverView.vue', import.meta.url), 'utf8')

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
